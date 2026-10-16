from django.urls import path

from .views import (
    ProvisionDashboardView,
    ProvisionMaterialCreateView,
    ProvisionMaterialUpdateView,
    ProvisionApproveRequestView,
    ProvisionRejectRequestView,
)


urlpatterns = [
    path(
        "dashboard/",
        ProvisionDashboardView.as_view(),
        name="provision-dashboard"
    ),

    path(
        "materials/",
        ProvisionMaterialCreateView.as_view(),
        name="provision-material-create"
    ),

    path(
        "materials/<int:pk>/",
        ProvisionMaterialUpdateView.as_view(),
        name="provision-material-update"
    ),

    path(
        "requests/<int:pk>/approve/",
        ProvisionApproveRequestView.as_view(),
        name="provision-request-approve"
    ),

    path(
        "requests/<int:pk>/reject/",
        ProvisionRejectRequestView.as_view(),
        name="provision-request-reject"
    ),
]