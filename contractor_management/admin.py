from django.contrib import admin, messages
from django.core.exceptions import ValidationError

from .models import Material, MaterialRequest


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "available_quantity",
        "unit",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
    )


@admin.register(MaterialRequest)
class MaterialRequestAdmin(admin.ModelAdmin):
    list_display = (
        "contractor",
        "material",
        "quantity",
        "status",
        "requested_at",
        "updated_at",
    )

    list_filter = (
        "status",
        "material",
        "requested_at",
    )

    search_fields = (
        "contractor__username",
        "material__name",
    )

    readonly_fields = (
        "contractor",
        "material",
        "quantity",
        "requested_at",
        "updated_at",
    )

    def save_model(self, request, obj, form, change):

        if change:
            old_obj = MaterialRequest.objects.get(pk=obj.pk)

            # Pending → Approved
            if (
                old_obj.status != "approved"
                and obj.status == "approved"
            ):

                material = obj.material

                if obj.quantity > material.available_quantity:
                    raise ValidationError(
                        f"Not enough stock available. "
                        f"Only {material.available_quantity} "
                        f"{material.unit} of {material.name} is available."
                    )

                # Reduce available stock
                material.available_quantity -= obj.quantity
                material.save()

                messages.success(
                    request,
                    f"{obj.quantity} {material.unit} of "
                    f"{material.name} has been deducted from stock."
                )

            # Prevent changing an already approved request
            if (
                old_obj.status == "approved"
                and obj.status != "approved"
            ):
                raise ValidationError(
                    "An approved material request cannot be changed."
                )

        super().save_model(request, obj, form, change)