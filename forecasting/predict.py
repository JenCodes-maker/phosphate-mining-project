import os

import joblib
import pandas as pd

from django.conf import settings


# =========================================================
# MODEL PATH
# =========================================================

MODEL_PATH = os.path.join(
    settings.BASE_DIR,
    "forecasting",
    "saved_models",
    "water_requirement_ridge_model.pkl"
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


# =========================================================
# WATER REQUIREMENT PREDICTION
# =========================================================

def predict_water_requirement(
    phosphate_production,
    phosphate_grade,
    operating_hours,
    equipment_utilization,
    temperature,
    rainfall,
    fuel_consumption,
):

    # -----------------------------------------------------
    # CHECK MODEL
    # -----------------------------------------------------

    if not os.path.exists(MODEL_PATH):

        raise FileNotFoundError(
            "Water forecasting model not found. "
            "Please train the Ridge Regression model first."
        )

    # -----------------------------------------------------
    # LOAD MODEL
    # -----------------------------------------------------

    model = joblib.load(
        MODEL_PATH
    )

    # -----------------------------------------------------
    # PREPARE INPUT
    # -----------------------------------------------------

    input_data = pd.DataFrame({

        "phosphate_production": [
            phosphate_production
        ],

        "phosphate_grade": [
            phosphate_grade
        ],

        "operating_hours": [
            operating_hours
        ],

        "equipment_utilization": [
            equipment_utilization
        ],

        "temperature": [
            temperature
        ],

        "rainfall": [
            rainfall
        ],

        "fuel_consumption": [
            fuel_consumption
        ],

    })

    # -----------------------------------------------------
    # PREDICT
    # -----------------------------------------------------

    prediction = model.predict(
        input_data
    )

    predicted_water = float(
        prediction[0]
    )

    return predicted_water