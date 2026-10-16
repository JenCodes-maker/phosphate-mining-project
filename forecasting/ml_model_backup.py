import os
import json
import joblib
import pandas as pd

from django.conf import settings

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

from mining.models import MiningData
from .models import ModelTrainingHistory


# =========================================================
# MODEL PATHS
# =========================================================

MODEL_DIRECTORY = os.path.join(
    settings.BASE_DIR,
    "forecasting",
    "saved_models"
)

MODEL_PATH = os.path.join(
    MODEL_DIRECTORY,
    "water_requirement_ridge_model.pkl"
)

METRICS_PATH = os.path.join(
    MODEL_DIRECTORY,
    "water_requirement_metrics.json"
)


# =========================================================
# FEATURES
# =========================================================

FEATURES = [
    "phosphate_production",
    "phosphate_grade",
    "operating_hours",
    "equipment_utilization",
    "temperature",
    "rainfall",
    "fuel_consumption",
]

TARGET = "water_consumption"


# =========================================================
# TRAIN RIDGE REGRESSION MODEL
# =========================================================

def train_forecasting_model():

    print("\n========================================")
    print("SUSTAINABLE PHOSPHATE MINING")
    print("RIDGE REGRESSION WATER FORECAST MODEL")
    print("========================================")

    # -----------------------------------------------------
    # GET DATA
    # -----------------------------------------------------

    records = MiningData.objects.all().values(
        "production_date",
        *FEATURES,
        TARGET
    )

    df = pd.DataFrame(list(records))

    print(
        f"\nTotal records available: {len(df)}"
    )

    # -----------------------------------------------------
    # CHECK MINIMUM DATA
    # -----------------------------------------------------

    if len(df) < 10:
        raise ValueError(
            "Not enough historical data for training."
        )

    # -----------------------------------------------------
    # SORT CHRONOLOGICALLY
    # -----------------------------------------------------

    df = df.sort_values(
        "production_date"
    ).reset_index(drop=True)

    # -----------------------------------------------------
    # REMOVE MISSING VALUES
    # -----------------------------------------------------

    df = df.dropna(
        subset=FEATURES + [TARGET]
    )

    print(
        f"Records after preprocessing: {len(df)}"
    )

    if len(df) < 10:
        raise ValueError(
            "Not enough valid records after preprocessing."
        )

    # -----------------------------------------------------
    # INPUT AND TARGET
    # -----------------------------------------------------

    X = df[FEATURES]

    y = df[TARGET]

    # -----------------------------------------------------
    # CHRONOLOGICAL TRAIN / TEST SPLIT
    # -----------------------------------------------------

    split_index = int(len(df) * 0.80)

    X_train = X.iloc[:split_index]

    X_test = X.iloc[split_index:]

    y_train = y.iloc[:split_index]

    y_test = y.iloc[split_index:]

    print(
        f"\nTraining records : {len(X_train)}"
    )

    print(
        f"Testing records  : {len(X_test)}"
    )

    # -----------------------------------------------------
    # RIDGE REGRESSION PIPELINE
    # -----------------------------------------------------

    model = Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "ridge",
            Ridge(alpha=1.0)
        )
    ])

    # -----------------------------------------------------
    # TRAIN
    # -----------------------------------------------------

    print(
        "\nTraining Ridge Regression model..."
    )

    model.fit(
        X_train,
        y_train
    )

    # -----------------------------------------------------
    # PREDICT
    # -----------------------------------------------------

    predictions = model.predict(
        X_test
    )

    # -----------------------------------------------------
    # EVALUATION
    # -----------------------------------------------------

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    rmse = mean_squared_error(
        y_test,
        predictions
    ) ** 0.5

    r2 = r2_score(
        y_test,
        predictions
    )

    # -----------------------------------------------------
    # DISPLAY RESULTS
    # -----------------------------------------------------

    print("\n========================================")
    print("MODEL PERFORMANCE")
    print("========================================")

    print(
        f"MAE  : {mae:.2f}"
    )

    print(
        f"RMSE : {rmse:.2f}"
    )

    print(
        f"R2   : {r2:.2f}"
    )

    # -----------------------------------------------------
    # CREATE DIRECTORY
    # -----------------------------------------------------

    os.makedirs(
        MODEL_DIRECTORY,
        exist_ok=True
    )

    # -----------------------------------------------------
    # SAVE RIDGE MODEL
    # -----------------------------------------------------

    joblib.dump(
        model,
        MODEL_PATH
    )

    print("\nModel saved to:")

    print(
        MODEL_PATH
    )

    # -----------------------------------------------------
    # SAVE METRICS
    # -----------------------------------------------------

    metrics = {

        "model": "Ridge Regression",

        "target": TARGET,

        "features": FEATURES,

        "training_records":
            len(X_train),

        "testing_records":
            len(X_test),

        "mae":
            round(mae, 4),

        "rmse":
            round(rmse, 4),

        "r2_score":
            round(r2, 4),

        "alpha": 1.0
    }

    with open(
        METRICS_PATH,
        "w"
    ) as file:

        json.dump(
            metrics,
            file,
            indent=4
        )

        print("\nMetrics saved to:")

    print(
        METRICS_PATH
    )

    # -----------------------------------------------------
    # SAVE TRAINING HISTORY TO DATABASE
    # -----------------------------------------------------

    ModelTrainingHistory.objects.create(
        model_name="Ridge Regression",
        target_variable=TARGET,
        training_records=len(X_train),
        testing_records=len(X_test),
        mae=round(mae, 4),
        rmse=round(rmse, 4),
        r2_score=round(r2, 4),
        alpha=1.0
    )

    print("\nTraining history saved to database.")

    print("\n========================================")
    print("RIDGE MODEL TRAINING COMPLETED")
    print("========================================")

    return model
    
    return model