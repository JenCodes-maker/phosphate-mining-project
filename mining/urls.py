from django.urls import path

from .views import (
    MiningDataListCreateView,
    MiningDataDetailView,
)


urlpatterns = [
    path('', MiningDataListCreateView.as_view(), name='mining-data'),
    path('<int:pk>/', MiningDataDetailView.as_view(), name='mining-data-detail'),
]