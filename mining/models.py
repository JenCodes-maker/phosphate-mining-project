from django.db import models


class MiningData(models.Model):

    mine_name = models.CharField(max_length=100)

    location = models.CharField(max_length=150)

    production_date = models.DateField()

    phosphate_production = models.FloatField()

    phosphate_grade = models.FloatField()

    operating_hours = models.FloatField()

    equipment_utilization = models.FloatField()

    temperature = models.FloatField()

    rainfall = models.FloatField()
    
    energy_consumption = models.FloatField(default=0)

    water_consumption = models.FloatField(default=0)

    fuel_consumption = models.FloatField(default=0)

    waste_generated = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.mine_name} - {self.production_date}"