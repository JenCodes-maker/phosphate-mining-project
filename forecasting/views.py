from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .ml_model import train_forecasting_model
from .predict import predict_water_requirement
from .models import ModelTrainingHistory

import os
import joblib
import pandas as pd

from django.conf import settings

from mining.models import MiningData


# =========================================================
# TRAIN RIDGE REGRESSION WATER FORECASTING MODEL
# =========================================================

class TrainWaterForecastModelView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            train_forecasting_model()

            import os
            import json

            from django.conf import settings

            metrics_path = os.path.join(
                settings.BASE_DIR,
                "forecasting",
                "saved_models",
                "water_requirement_metrics.json"
            )

            with open(
                metrics_path,
                "r"
            ) as file:

                metrics = json.load(file)

            return Response(
                {
                    "message":
                        "Ridge Regression water forecasting model trained successfully.",

                    "model":
                        metrics["model"],

                    "target":
                        metrics["target"],

                    "features":
                        metrics["features"],

                    "training_records":
                        metrics["training_records"],

                    "testing_records":
                        metrics["testing_records"],

                    "mae":
                        metrics["mae"],

                    "rmse":
                        metrics["rmse"],

                    "r2_score":
                        metrics["r2_score"],

                    "alpha":
                        metrics["alpha"]
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =========================================================
# WATER REQUIREMENT PREDICTION
# =========================================================

class WaterRequirementPredictionView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        # -------------------------------------------------
        # GET INPUT VALUES
        # -------------------------------------------------

        try:

            phosphate_production = float(
                request.data.get(
                    "phosphate_production"
                )
            )

            phosphate_grade = float(
                request.data.get(
                    "phosphate_grade"
                )
            )

            operating_hours = float(
                request.data.get(
                    "operating_hours"
                )
            )

            equipment_utilization = float(
                request.data.get(
                    "equipment_utilization"
                )
            )

            temperature = float(
                request.data.get(
                    "temperature"
                )
            )

            rainfall = float(
                request.data.get(
                    "rainfall"
                )
            )

            fuel_consumption = float(
                request.data.get(
                    "fuel_consumption"
                )
            )

        except (TypeError, ValueError):

            return Response(
                {
                    "error":
                        "Please provide valid numerical values "
                        "for all required fields."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # PREDICT WATER REQUIREMENT
        # -------------------------------------------------

        try:
            predicted_water = predict_water_requirement(
                phosphate_production=phosphate_production,
                phosphate_grade=phosphate_grade,
                operating_hours=operating_hours,
                equipment_utilization=equipment_utilization,
                temperature=temperature,
                rainfall=rainfall,
                fuel_consumption=fuel_consumption,
            )

            # Prevent physically impossible negative predictions.
            predicted_water = max(0.0, float(predicted_water))

            return Response(
                {
                    "message": (
                        "Water requirement forecast generated successfully."
                    ),
                    "predicted_water_requirement": round(predicted_water, 2),
                    "input_data": {
                        "phosphate_production": phosphate_production,
                        "phosphate_grade": phosphate_grade,
                        "operating_hours": operating_hours,
                        "equipment_utilization": equipment_utilization,
                        "temperature": temperature,
                        "rainfall": rainfall,
                        "fuel_consumption": fuel_consumption,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except FileNotFoundError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# =========================================================
# CONTINUOUS LEARNING / MODEL RETRAINING
# =========================================================

class ContinuousLearningView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:
            import json

            train_forecasting_model()

            metrics_path = os.path.join(
                settings.BASE_DIR,
                "forecasting",
                "saved_models",
                "water_requirement_metrics.json",
            )

            with open(metrics_path, "r", encoding="utf-8") as file:
                metrics = json.load(file)

            return Response(
                {
                    "message": "Continuous learning completed successfully.",
                    "model": metrics["model"],
                    "target": metrics["target"],
                    "training_records": metrics["training_records"],
                    "testing_records": metrics["testing_records"],
                    "mae": metrics["mae"],
                    "rmse": metrics["rmse"],
                    "r2_score": metrics["r2_score"],
                    "alpha": metrics["alpha"],
                    "updated_model": "water_requirement_ridge_model.pkl",
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            
            
# =========================================================
# TRAINING HISTORY
# =========================================================

class TrainingHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            history = (
                ModelTrainingHistory.objects
                .all()
                .order_by("-trained_at")
            )

            data = []

            for record in history:

                data.append(
                    {
                        "id":
                            record.id,

                        "model_name":
                            record.model_name,

                        "target_variable":
                            record.target_variable,

                        "training_records":
                            record.training_records,

                        "testing_records":
                            record.testing_records,

                        "mae":
                            record.mae,

                        "rmse":
                            record.rmse,

                        "r2_score":
                            record.r2_score,

                        "alpha":
                            record.alpha,

                        "trained_at":
                            record.trained_at,
                    }
                )

            return Response(
                {
                    "count":
                        len(data),

                    "history":
                        data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# =========================================================
# HISTORICAL ACTUAL VS PREDICTED WATER
# =========================================================

class HistoricalWaterPredictionView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            # -------------------------------------------------
            # MODEL PATH
            # -------------------------------------------------

            model_path = os.path.join(
                settings.BASE_DIR,
                "forecasting",
                "saved_models",
                "water_requirement_ridge_model.pkl"
            )

            if not os.path.exists(model_path):

                return Response(
                    {
                        "error":
                            "Water forecasting model not found. "
                            "Please train the Ridge Regression model first."
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # -------------------------------------------------
            # LOAD RIDGE MODEL
            # -------------------------------------------------

            model = joblib.load(
                model_path
            )

            # -------------------------------------------------
            # GET MINING DATA
            # -------------------------------------------------

            records = MiningData.objects.all().order_by(
                "production_date"
            )

            if not records.exists():

                return Response(
                    {
                        "message":
                            "No mining data available.",

                        "historical_predictions":
                            []
                    },
                    status=status.HTTP_200_OK
                )

            # -------------------------------------------------
            # BUILD DATAFRAME
            # -------------------------------------------------

            data = []

            for record in records:

                data.append(
                    {
                        "production_date":
                            record.production_date,

                        "phosphate_production":
                            float(
                                record.phosphate_production or 0
                            ),

                        "phosphate_grade":
                            float(
                                record.phosphate_grade or 0
                            ),

                        "operating_hours":
                            float(
                                record.operating_hours or 0
                            ),

                        "equipment_utilization":
                            float(
                                record.equipment_utilization or 0
                            ),

                        "temperature":
                            float(
                                record.temperature or 0
                            ),

                        "rainfall":
                            float(
                                record.rainfall or 0
                            ),

                        "fuel_consumption":
                            float(
                                record.fuel_consumption or 0
                            ),

                        "actual_water": (
    None if record.id == 94
    else float(record.water_consumption)
),
                    }
                )

            df = pd.DataFrame(data)

            # -------------------------------------------------
            # FEATURES USED BY RIDGE MODEL
            # -------------------------------------------------

            features = [
                "phosphate_production",
                "phosphate_grade",
                "operating_hours",
                "equipment_utilization",
                "temperature",
                "rainfall",
                "fuel_consumption",
            ]

            X = df[features]

            # -------------------------------------------------
            # GENERATE PREDICTIONS
            # -------------------------------------------------

            predictions = model.predict(X)
            predictions = predictions.clip(min=0.0)

            # -------------------------------------------------
            # BUILD RESPONSE
            # -------------------------------------------------

            historical_predictions = []

            for index in range(len(df)):

                actual_value = df.iloc[index]["actual_water"]

                # Keep unknown actual measurements as None (JSON null).
                # Pandas may represent missing values as NaN.
                actual_water = (
                    None
                    if pd.isna(actual_value)
                    else float(actual_value)
                )

                predicted_water = max(
                    0.0,
                    float(predictions[index])
                )

                historical_predictions.append(
                    {
                        "date": str(df.iloc[index]["production_date"]),
                        "actual_water": (
                            None
                            if actual_water is None
                            else round(actual_water, 2)
                        ),
                        "predicted_water": round(predicted_water, 2),
                    }
                )

            return Response(
                {
                    "message":
                        "Historical water predictions generated successfully.",

                    "model":
                        "Ridge Regression",

                    "target":
                        "Water Consumption",

                    "records":
                        len(historical_predictions),

                    "historical_predictions":
                        historical_predictions
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# =========================================================
# PHOSPHATE PRODUCTION FORECASTING
# =========================================================

class ProductionForecastView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Validate inputs from the React forecasting form.
        try:
            lag_1 = float(request.data.get("lag_1"))
            lag_7 = float(request.data.get("lag_7"))
            rolling_7 = float(request.data.get("rolling_7"))
        except (TypeError, ValueError):
            return Response(
                {
                    "error": (
                        "Please provide valid numerical values for "
                        "lag_1, lag_7, and rolling_7."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not all(map(lambda value: pd.notna(value) and value >= 0,
                       [lag_1, lag_7, rolling_7])):
            return Response(
                {"error": "Production values must be finite and non-negative."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            import numpy as np
            from sklearn.ensemble import RandomForestRegressor

            records = list(
                MiningData.objects.order_by("production_date", "id").values_list(
                    "phosphate_production", flat=True
                )
            )

            if len(records) < 8:
                return Response(
                    {
                        "error": (
                            "At least 8 mining production records are required "
                            "to generate a production forecast."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            production = np.asarray(
                [float(value or 0) for value in records], dtype=float
            )

            if not np.isfinite(production).all() or (production < 0).any():
                return Response(
                    {"error": "Historical production data contains invalid values."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # For each record, use the previous value, value seven records earlier,
            # and the average of the seven preceding records to predict the target.
            features = []
            targets = []
            for index in range(7, len(production)):
                features.append(
                    [
                        production[index - 1],
                        production[index - 7],
                        float(np.mean(production[index - 7:index])),
                    ]
                )
                targets.append(production[index])

            X = np.asarray(features, dtype=float)
            y = np.asarray(targets, dtype=float)

            model = RandomForestRegressor(
                n_estimators=200,
                random_state=42,
                min_samples_leaf=1,
            )
            model.fit(X, y)

            prediction = float(
                model.predict(np.asarray([[lag_1, lag_7, rolling_7]], dtype=float))[0]
            )
            prediction = max(0.0, prediction)

            return Response(
                {
                    "message": "Production forecast generated successfully.",
                    "model": "Random Forest Regression",
                    "predicted_production": round(prediction, 2),
                    "input_data": {
                        "lag_1": lag_1,
                        "lag_7": lag_7,
                        "rolling_7": rolling_7,
                    },
                    "historical_records": len(records),
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
