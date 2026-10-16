from rest_framework import serializers
from .models import Material, MaterialRequest


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = "__all__"


class MaterialRequestSerializer(serializers.ModelSerializer):
    contractor_name = serializers.CharField(
        source="contractor.username",
        read_only=True
    )

    material_name = serializers.CharField(
        source="material.name",
        read_only=True
    )

    class Meta:
        model = MaterialRequest

        fields = [
            "id",
            "contractor",
            "contractor_name",
            "material",
            "material_name",
            "quantity",
            "status",
            "requested_at",
            "updated_at",
        ]

        read_only_fields = [
            "contractor",
            "status",
            "requested_at",
            "updated_at",
        ]