from django.contrib.auth.models import User
from django.db import models


class Material(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    available_quantity = models.FloatField(default=0)
    unit = models.CharField(max_length=30, default="units")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class MaterialRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    contractor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="material_requests"
    )

    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="requests"
    )

    quantity = models.FloatField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    requested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            f"{self.contractor.username} - "
            f"{self.material.name} - "
            f"{self.status}"
        )