from django.urls import path

from .views import (
    AnalyticsDashboardView,
    MiningReportCSVView,
    SustainableWaterDashboardView,
    SustainabilityInsightsView,
)

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from mining.models import MiningData

urlpatterns = [

    # Analytics Dashboard
    path(
        "analytics/",
        AnalyticsDashboardView.as_view(),
        name="analytics-dashboard",
    ),

    # Mining Report CSV
    path(
        "report/csv/",
        MiningReportCSVView.as_view(),
        name="mining-report-csv",
    ),

    # Sustainable Water Dashboard
    path(
        "sustainable-water/",
        SustainableWaterDashboardView.as_view(),
        name="sustainable-water-dashboard",
    ),

    # Sustainability Insights
    path(
        "sustainability-insights/",
        SustainabilityInsightsView.as_view(),
        name="sustainability-insights",
    ),
]