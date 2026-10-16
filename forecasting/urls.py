from django.urls import path

from .views import (
    TrainWaterForecastModelView,
    WaterRequirementPredictionView,
    ContinuousLearningView,
    TrainingHistoryView,
    HistoricalWaterPredictionView,
    ProductionForecastView,
)

urlpatterns = [
    path("production/", ProductionForecastView.as_view(), name="production-forecast"),
    path("water/train/", TrainWaterForecastModelView.as_view(), name="train-water-forecast"),
    path("water/predict/", WaterRequirementPredictionView.as_view(), name="water-requirement-prediction"),
    path("water/retrain/", ContinuousLearningView.as_view(), name="continuous-learning"),
    path("water/training-history/", TrainingHistoryView.as_view(), name="training-history"),
    path("water/historical-predictions/", HistoricalWaterPredictionView.as_view(), name="historical-water-predictions"),
]