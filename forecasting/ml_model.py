"""Water forecasting: compare models and safely tune Ridge without promoting it."""
import json
import os

import joblib
import numpy as np
import pandas as pd
from django.conf import settings
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.inspection import permutation_importance
from sklearn.preprocessing import StandardScaler

from mining.models import MiningData
from .models import ModelTrainingHistory

MODEL_DIRECTORY = os.path.join(settings.BASE_DIR, "forecasting", "saved_models")
MODEL_PATH = os.path.join(MODEL_DIRECTORY, "water_requirement_ridge_model.pkl")
METRICS_PATH = os.path.join(MODEL_DIRECTORY, "water_requirement_metrics.json")
COMPARISON_PATH = os.path.join(MODEL_DIRECTORY, "water_requirement_model_comparison.json")
TUNING_PATH = os.path.join(MODEL_DIRECTORY, "water_requirement_ridge_tuning.json")
FEATURE_IMPORTANCE_PATH = os.path.join(MODEL_DIRECTORY, "water_requirement_feature_importance.json")

FEATURES = [
    "phosphate_production", "phosphate_grade", "operating_hours",
    "equipment_utilization", "temperature", "rainfall", "fuel_consumption",
]
TARGET = "water_consumption"
ALPHA_VALUES = [0.01, 0.1, 1.0, 10.0, 100.0]


def _ridge(alpha):
    return Pipeline([("scaler", StandardScaler()), ("regressor", Ridge(alpha=alpha))])


def _metrics(actual, predicted):
    return {
        "mae": round(float(mean_absolute_error(actual, predicted)), 4),
        "rmse": round(float(np.sqrt(mean_squared_error(actual, predicted))), 4),
        "r2_score": round(float(r2_score(actual, predicted)), 4) if len(actual) > 1 else None,
    }


def train_forecasting_model():
    """Train the existing Ridge model; compare alternatives and tune safely.

    The last 20% is reserved as a final test set. Alpha is chosen using
    the last 20% of the earlier training portion, NOT the final test set.
    The active model remains Ridge(alpha=1.0) until explicitly changed.
    """
    df = pd.DataFrame(
    list(
        MiningData.objects.exclude(id=94).values(
            "production_date", *FEATURES, TARGET
        )
    )
)
    if len(df) < 15:
        raise ValueError("At least 15 mining records are required for tuning.")
    df = df.sort_values("production_date").reset_index(drop=True)
    for col in FEATURES + [TARGET]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.replace([np.inf, -np.inf], np.nan).dropna(subset=FEATURES + [TARGET])
    if len(df) < 15:
        raise ValueError("At least 15 valid mining records are required for tuning.")

    X, y = df[FEATURES], df[TARGET]
    outer_cut = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:outer_cut], X.iloc[outer_cut:]
    y_train, y_test = y.iloc[:outer_cut], y.iloc[outer_cut:]
    inner_cut = int(len(X_train) * 0.8)
    X_fit, X_val = X_train.iloc[:inner_cut], X_train.iloc[inner_cut:]
    y_fit, y_val = y_train.iloc[:inner_cut], y_train.iloc[inner_cut:]

    print("\n===== RIDGE ALPHA TUNING (CHRONOLOGICAL VALIDATION) =====")
    validation_results = []
    for alpha in ALPHA_VALUES:
        model = _ridge(alpha)
        model.fit(X_fit, y_fit)
        scores = _metrics(y_val, model.predict(X_val))
        validation_results.append({"alpha": alpha, **scores})
        print(f"alpha={alpha:<7} validation MAE={scores['mae']:<9} RMSE={scores['rmse']:<9} R2={scores['r2_score']}")

    best = min(validation_results, key=lambda row: row["mae"])
    best_alpha = best["alpha"]
    tuned_model = _ridge(best_alpha)
    tuned_model.fit(X_train, y_train)
    tuned_test = _metrics(y_test, tuned_model.predict(X_test))

    candidates = {
        "Ridge Regression": _ridge(1.0),
        "Random Forest Regression": RandomForestRegressor(
            n_estimators=200, random_state=42, min_samples_leaf=2, n_jobs=-1
        ),
        "Dummy Regression (Mean Baseline)": DummyRegressor(strategy="mean"),
    }
    results = []
    production_model = None
    print("\n===== FINAL HOLDOUT COMPARISON =====")
    for name, model in candidates.items():
        model.fit(X_train, y_train)
        scores = _metrics(y_test, model.predict(X_test))
        results.append({
            "model": name, "target": TARGET, "features": FEATURES,
            "training_records": len(X_train), "testing_records": len(X_test), **scores,
        })
        print(f"{name}: MAE={scores['mae']}, RMSE={scores['rmse']}, R2={scores['r2_score']}")
        if name == "Ridge Regression":
            production_model = model

    print(f"Tuned Ridge (alpha={best_alpha}): MAE={tuned_test['mae']}, RMSE={tuned_test['rmse']}, R2={tuned_test['r2_score']}")
    os.makedirs(MODEL_DIRECTORY, exist_ok=True)
    joblib.dump(production_model, MODEL_PATH)
    # Keep existing metrics format and the existing prediction endpoint intact.
    ridge_metrics = {**results[0], "alpha": 1.0}
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(ridge_metrics, f, indent=4)
    with open(COMPARISON_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "target": TARGET, "features": FEATURES,
            "split_method": "chronological 80/20", "training_records": len(X_train),
            "testing_records": len(X_test), "production_model": "Ridge Regression",
            "results": results,
        }, f, indent=4)
    with open(TUNING_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "alpha_values_tested": ALPHA_VALUES,
            "validation_records": len(X_val), "validation_results": validation_results,
            "best_alpha_by_validation_mae": best_alpha,
            "tuned_ridge_final_test": tuned_test,
            "current_ridge_final_test": _metrics(y_test, production_model.predict(X_test)),
            "production_model": "Ridge Regression (alpha=1.0)",
            "tuned_model_activated": False,
            "note": "The tuned model is evaluated only; the active Ridge model remains alpha=1.0.",
        }, f, indent=4)

    # Permutation importance estimates how much each feature affects holdout
    # predictive performance. It is descriptive only and does not change the model.
    importance_result = permutation_importance(
        production_model, X_test, y_test,
        scoring="neg_mean_absolute_error", n_repeats=30, random_state=42, n_jobs=-1,
    )
    importance_rows = []
    for index, feature in enumerate(FEATURES):
        importance_rows.append({
            "feature": feature,
            "importance_mean": round(float(importance_result.importances_mean[index]), 6),
            "importance_std": round(float(importance_result.importances_std[index]), 6),
        })
    importance_rows.sort(key=lambda row: row["importance_mean"], reverse=True)

    with open(FEATURE_IMPORTANCE_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "model": "Ridge Regression (alpha=1.0)",
            "target": TARGET,
            "method": "Permutation importance using negative MAE on chronological holdout",
            "testing_records": int(len(X_test)),
            "repeats": 30,
            "interpretation": (
                "Higher positive importance means shuffling the feature worsened MAE more. "
                "Values near zero suggest little measurable effect in this test set; "
                "negative values can occur from sampling noise or correlated features. "
                "Importance does not establish causation and is not used to select the model."
            ),
            "results": importance_rows,
        }, f, indent=4)

    print("\n===== RIDGE FEATURE IMPORTANCE (PERMUTATION) =====")
    for row in importance_rows:
        print(f"{row['feature']}: importance={row['importance_mean']} (std={row['importance_std']})")
    print(f"Feature importance saved to: {FEATURE_IMPORTANCE_PATH}")

    # Preserve the current Continuous Learning / history schema.
    for row in results:
        ModelTrainingHistory.objects.create(
            model_name=row["model"], target_variable=TARGET,
            training_records=row["training_records"],
            testing_records=row["testing_records"], mae=row["mae"],
            rmse=row["rmse"], r2_score=row["r2_score"] or 0.0, alpha=1.0,
        )
    print(f"\nBest validation alpha: {best_alpha}")
    print(f"Tuning details saved to: {TUNING_PATH}")
    print("Active model remains Ridge(alpha=1.0).")
    return production_model
