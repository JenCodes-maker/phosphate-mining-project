from django.contrib import admin
from .models import MiningData


@admin.register(MiningData)
class MiningDataAdmin(admin.ModelAdmin):

    list_display = (
    'mine_name',
    'location',
    'production_date',
    'phosphate_production',
    'phosphate_grade',
    'operating_hours',
    'equipment_utilization',
    'temperature',
    'rainfall',
    'energy_consumption',
    'water_consumption',
    'fuel_consumption',
    'waste_generated',
)

    list_filter = (
        'mine_name',
        'location',
        'production_date',
    )

    search_fields = (
        'mine_name',
        'location',
    )