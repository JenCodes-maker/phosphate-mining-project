from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [

    # Django Admin
    path(
        "admin/",
        admin.site.urls
    ),

    # Authentication
    path(
        "api/auth/",
        include("accounts.urls")
    ),

    # Mining
    path(
        "api/mining/",
        include("mining.urls")
    ),

    # Forecasting
    path(
        "api/forecasting/",
        include("forecasting.urls")
    ),

    # Contractor Management
    path(
        "api/contractor/",
        include("contractor_management.urls")
    ),

    # Provision Management
    path(
        "api/provision/",
        include("provision_management.urls")
    ),

    # Dashboard
    path(
        "api/dashboard/",
        include("dashboard.urls")
    ),

    # JWT Token Refresh
    path(
        "api/auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),
]