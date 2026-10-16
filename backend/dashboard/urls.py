from django.urls import path

from .views import (
    AnalyticsDashboardView,
    MiningReportCSVView,
    SustainabilityInsightsView,
)

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

    # Sustainability Insights
    path(
        "sustainability-insights/",
        SustainabilityInsightsView.as_view(),
        name="sustainability-insights",
    ),

]