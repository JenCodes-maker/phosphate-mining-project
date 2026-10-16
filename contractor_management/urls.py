from django.urls import path

from .views import (
    MaterialListView,
    MaterialRequestListCreateView
)


urlpatterns = [
    path(
        "materials/",
        MaterialListView.as_view(),
        name="materials"
    ),

    path(
        "requests/",
        MaterialRequestListCreateView.as_view(),
        name="material-requests"
    ),
]