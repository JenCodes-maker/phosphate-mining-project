from rest_framework import generics
from rest_framework.permissions import BasePermission

from .models import Material, MaterialRequest
from .serializers import (
    MaterialSerializer,
    MaterialRequestSerializer
)


class IsContractor(BasePermission):
    """
    Allows access only to users with contractor role.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            return request.user.profile.role == "contractor"
        except Exception:
            return False


class MaterialListView(generics.ListAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsContractor]


class MaterialRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = MaterialRequestSerializer
    permission_classes = [IsContractor]

    def get_queryset(self):
        return MaterialRequest.objects.filter(
            contractor=self.request.user
        ).order_by("-requested_at")

    def perform_create(self, serializer):
        serializer.save(
            contractor=self.request.user
        )