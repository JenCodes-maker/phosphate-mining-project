from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from contractor_management.models import Material, MaterialRequest


class IsProvision(BasePermission):
    """
    Allows access only to users with provision role.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            return request.user.profile.role == "provision"
        except Exception:
            return False


class ProvisionDashboardView(APIView):
    permission_classes = [IsProvision]

    def get(self, request):

        materials = Material.objects.all()

        requests = MaterialRequest.objects.select_related(
            "contractor",
            "material"
        ).order_by("-requested_at")

        # Summary calculations
        total_materials = materials.count()

        total_stock = sum(
            material.available_quantity
            for material in materials
        )

        pending_requests = requests.filter(
            status="pending"
        ).count()

        approved_requests = requests.filter(
            status="approved"
        ).count()

        rejected_requests = requests.filter(
            status="rejected"
        ).count()

        # Material information
        material_data = []

        for material in materials:
            material_data.append({
                "id": material.id,
                "name": material.name,
                "description": material.description,
                "available_quantity": material.available_quantity,
                "unit": material.unit,
            })

        # Request information
        request_data = []

        for material_request in requests:
            request_data.append({
                "id": material_request.id,
                "contractor": material_request.contractor.username,
                "material": material_request.material.name,
                "quantity": material_request.quantity,
                "unit": material_request.material.unit,
                "status": material_request.status,
                "requested_at": material_request.requested_at,
            })

        # IMPORTANT: return the API response
        return Response({
            "summary": {
                "total_materials": total_materials,
                "total_stock": total_stock,
                "pending_requests": pending_requests,
                "approved_requests": approved_requests,
                "rejected_requests": rejected_requests,
            },

            "materials": material_data,

            "requests": request_data,
        })


class ProvisionMaterialCreateView(APIView):
    permission_classes = [IsProvision]

    def post(self, request):

        name = request.data.get("name")
        description = request.data.get("description", "")
        available_quantity = request.data.get(
            "available_quantity",
            0
        )
        unit = request.data.get(
            "unit",
            "units"
        )

        if not name:
            return Response(
                {
                    "error": "Material name is required."
                },
                status=400
            )

        try:
            available_quantity = float(
                available_quantity
            )

            if available_quantity < 0:
                return Response(
                    {
                        "error": "Quantity cannot be negative."
                    },
                    status=400
                )

        except (TypeError, ValueError):

            return Response(
                {
                    "error": "Please provide a valid quantity."
                },
                status=400
            )

        material = Material.objects.create(
            name=name,
            description=description,
            available_quantity=available_quantity,
            unit=unit
        )
    
class ProvisionMaterialUpdateView(APIView):
    permission_classes = [IsProvision]

    def put(self, request, pk):

        try:
            material = Material.objects.get(pk=pk)
        except Material.DoesNotExist:
            return Response(
                {
                    "error": "Material not found."
                },
                status=404
            )

        available_quantity = request.data.get(
            "available_quantity"
        )

        if available_quantity is None:
            return Response(
                {
                    "error": "Available quantity is required."
                },
                status=400
            )

        try:
            available_quantity = float(
                available_quantity
            )

            if available_quantity < 0:
                return Response(
                    {
                        "error": "Quantity cannot be negative."
                    },
                    status=400
                )

        except (TypeError, ValueError):
            return Response(
                {
                    "error": "Please provide a valid quantity."
                },
                status=400
            )

        material.available_quantity = available_quantity
        material.save()

        return Response({
            "message": "Stock updated successfully.",
            "material": {
                "id": material.id,
                "name": material.name,
                "available_quantity":
                    material.available_quantity,
                "unit": material.unit,
            }
        })
        
class ProvisionApproveRequestView(APIView):
    permission_classes = [IsProvision]

    def post(self, request, pk):
        try:
            material_request = MaterialRequest.objects.select_related(
                "material",
                "contractor"
            ).get(pk=pk)
        except MaterialRequest.DoesNotExist:
            return Response(
                {"error": "Material request not found."},
                status=404
            )

        if material_request.status != "pending":
            return Response(
                {
                    "error": (
                        f"This request is already "
                        f"{material_request.status}."
                    )
                },
                status=400
            )

        material = material_request.material

        if material_request.quantity > material.available_quantity:
            return Response(
                {
                    "error": (
                        f"Insufficient stock. Only "
                        f"{material.available_quantity} "
                        f"{material.unit} of {material.name} "
                        f"is available."
                    )
                },
                status=400
            )

        material.available_quantity -= material_request.quantity
        material.save()

        material_request.status = "approved"
        material_request.save()

        return Response({
            "message": "Material request approved successfully.",
            "request": {
                "id": material_request.id,
                "status": material_request.status,
                "material": material.name,
                "quantity": material_request.quantity,
                "remaining_stock": material.available_quantity,
            }
        })
        
class ProvisionRejectRequestView(APIView):
    permission_classes = [IsProvision]

    def post(self, request, pk):
        try:
            material_request = MaterialRequest.objects.get(pk=pk)
        except MaterialRequest.DoesNotExist:
            return Response(
                {"error": "Material request not found."},
                status=404
            )

        if material_request.status != "pending":
            return Response(
                {
                    "error": (
                        f"This request is already "
                        f"{material_request.status}."
                    )
                },
                status=400
            )

        material_request.status = "rejected"
        material_request.save()

        return Response({
            "message": "Material request rejected successfully.",
            "request": {
                "id": material_request.id,
                "status": material_request.status,
            }
        })

        return Response(
            {
                "message": "Material added successfully.",

                "material": {
                    "id": material.id,
                    "name": material.name,
                    "description": material.description,
                    "available_quantity": material.available_quantity,
                    "unit": material.unit,
                }
            },
            status=201
        )