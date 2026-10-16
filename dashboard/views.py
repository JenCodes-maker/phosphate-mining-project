import csv

from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from mining.models import MiningData


# =========================================================
# ANALYTICS DASHBOARD
# =========================================================

class AnalyticsDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        records = MiningData.objects.all().order_by("production_date")

        # -----------------------------------------
        # DATE FILTERS
        # -----------------------------------------

        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")

        if from_date:
            records = records.filter(
                production_date__gte=from_date
            )

        if to_date:
            records = records.filter(
                production_date__lte=to_date
            )

        # -----------------------------------------
        # NO DATA
        # -----------------------------------------

        if not records.exists():
            return Response({
                "message": (
                    "No mining data available "
                    "for the selected date range."
                ),
                "summary": {},
                "production_trend": [],
                "sustainability": {},
            })

        # -----------------------------------------
        # SUMMARY CALCULATIONS
        # -----------------------------------------

        total_production = sum(
            record.phosphate_production
            for record in records
        )

        average_grade = sum(
            record.phosphate_grade
            for record in records
        ) / records.count()

        average_utilization = sum(
            record.equipment_utilization
            for record in records
        ) / records.count()

        average_operating_hours = sum(
            record.operating_hours
            for record in records
        ) / records.count()

        # -----------------------------------------
        # SUSTAINABILITY CALCULATIONS
        # -----------------------------------------

        total_energy = sum(
            record.energy_consumption
            for record in records
        )

        total_water = sum(
            record.water_consumption
            for record in records
        )

        total_fuel = sum(
            record.fuel_consumption
            for record in records
        )

        total_waste = sum(
            record.waste_generated
            for record in records
        )

        # -----------------------------------------
        # PRODUCTION TREND
        # -----------------------------------------

        production_trend = []

        for record in records:

            production_trend.append({
                "date": record.production_date,
                "production": record.phosphate_production,
                "grade": record.phosphate_grade,
                "utilization": record.equipment_utilization,
                "operating_hours": record.operating_hours,
            })

        # -----------------------------------------
        # ANALYTICS RESPONSE
        # -----------------------------------------

        return Response({

            "summary": {

                "total_records": records.count(),

                "total_production": round(
                    total_production,
                    2
                ),

                "average_grade": round(
                    average_grade,
                    2
                ),

                "average_utilization": round(
                    average_utilization,
                    2
                ),

                "average_operating_hours": round(
                    average_operating_hours,
                    2
                ),
            },

            "sustainability": {

                "total_energy": round(
                    total_energy,
                    2
                ),

                "total_water": round(
                    total_water,
                    2
                ),

                "total_fuel": round(
                    total_fuel,
                    2
                ),

                "total_waste": round(
                    total_waste,
                    2
                ),
            },

            "production_trend": production_trend,
        })


# =========================================================
# CSV MINING REPORT
# =========================================================

class MiningReportCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        records = MiningData.objects.all().order_by(
            "production_date"
        )

        # -----------------------------------------
        # DATE FILTERS
        # -----------------------------------------

        from_date = request.query_params.get(
            "from_date"
        )

        to_date = request.query_params.get(
            "to_date"
        )

        if from_date:
            records = records.filter(
                production_date__gte=from_date
            )

        if to_date:
            records = records.filter(
                production_date__lte=to_date
            )

        # -----------------------------------------
        # CREATE CSV RESPONSE
        # -----------------------------------------

        response = HttpResponse(
            content_type="text/csv"
        )

        response["Content-Disposition"] = (
            'attachment; filename="mining_report.csv"'
        )

        writer = csv.writer(response)

        # -----------------------------------------
        # CSV HEADER
        # -----------------------------------------

        writer.writerow([
            "Mine Name",
            "Location",
            "Production Date",
            "Phosphate Production",
            "Phosphate Grade",
            "Operating Hours",
            "Equipment Utilization",
            "Temperature",
            "Rainfall",
            "Energy Consumption",
            "Water Consumption",
            "Fuel Consumption",
            "Waste Generated",
        ])

        # -----------------------------------------
        # CSV RECORDS
        # -----------------------------------------

        for record in records:

            writer.writerow([
                record.mine_name,
                record.location,
                record.production_date,
                record.phosphate_production,
                record.phosphate_grade,
                record.operating_hours,
                record.equipment_utilization,
                record.temperature,
                record.rainfall,
                record.energy_consumption,
                record.water_consumption,
                record.fuel_consumption,
                record.waste_generated,
            ])

        # -----------------------------------------
        # RETURN CSV
        # -----------------------------------------

        return response


# =========================================================
# SUSTAINABLE WATER MANAGEMENT DASHBOARD
# =========================================================

class SustainableWaterDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            records = MiningData.objects.all().order_by(
                "production_date"
            )

            # -----------------------------------------
            # NO DATA
            # -----------------------------------------

            if not records.exists():

                return Response(
                    {
                        "message": "No mining data available.",

                        "summary": {
                            "total_water_consumption": 0,
                            "average_water_consumption": 0,
                            "total_phosphate_production": 0,
                            "average_phosphate_production": 0,
                            "average_temperature": 0,
                            "average_rainfall": 0,
                            "average_fuel_consumption": 0,
                            "average_equipment_utilization": 0,
                        },

                        "latest_data": {},

                        "historical_data": [],
                    },
                    status=status.HTTP_200_OK
                )

            # -----------------------------------------
            # SUMMARY CALCULATIONS
            # -----------------------------------------

            record_count = records.count()

            total_water = sum(
                float(record.water_consumption or 0)
                for record in records
            )

            average_water = (
                total_water / record_count
            )

            total_production = sum(
                float(record.phosphate_production or 0)
                for record in records
            )

            average_production = (
                total_production / record_count
            )

            average_temperature = (
                sum(
                    float(record.temperature or 0)
                    for record in records
                )
                / record_count
            )

            average_rainfall = (
                sum(
                    float(record.rainfall or 0)
                    for record in records
                )
                / record_count
            )

            average_fuel = (
                sum(
                    float(record.fuel_consumption or 0)
                    for record in records
                )
                / record_count
            )

            average_utilization = (
                sum(
                    float(record.equipment_utilization or 0)
                    for record in records
                )
                / record_count
            )

            # -----------------------------------------
            # HISTORICAL DATA
            # -----------------------------------------

            historical_data = []

            for record in records:

                historical_data.append({
                    "date": record.production_date,

                    "water_consumption": float(
                        record.water_consumption or 0
                    ),

                    "phosphate_production": float(
                        record.phosphate_production or 0
                    ),

                    "temperature": float(
                        record.temperature or 0
                    ),

                    "rainfall": float(
                        record.rainfall or 0
                    ),

                    "fuel_consumption": float(
                        record.fuel_consumption or 0
                    ),

                    "equipment_utilization": float(
                        record.equipment_utilization or 0
                    ),

                    "waste_generated": float(
                        record.waste_generated or 0
                    ),
                })

            # -----------------------------------------
            # LATEST RECORD
            # -----------------------------------------

            latest = records.last()

            latest_data = {
                "date": latest.production_date,

                "water_consumption": float(
                    latest.water_consumption or 0
                ),

                "phosphate_production": float(
                    latest.phosphate_production or 0
                ),

                "temperature": float(
                    latest.temperature or 0
                ),

                "rainfall": float(
                    latest.rainfall or 0
                ),

                "fuel_consumption": float(
                    latest.fuel_consumption or 0
                ),

                "equipment_utilization": float(
                    latest.equipment_utilization or 0
                ),

                "waste_generated": float(
                    latest.waste_generated or 0
                ),

                "phosphate_grade": float(
                    latest.phosphate_grade or 0
                ),

                "operating_hours": float(
                    latest.operating_hours or 0
                ),
            }

            # -----------------------------------------
            # RESPONSE
            # -----------------------------------------

            return Response(
                {
                    "message": (
                        "Sustainable water dashboard "
                        "data retrieved successfully."
                    ),

                    "summary": {

                        "total_water_consumption": round(
                            total_water,
                            2
                        ),

                        "average_water_consumption": round(
                            average_water,
                            2
                        ),

                        "total_phosphate_production": round(
                            total_production,
                            2
                        ),

                        "average_phosphate_production": round(
                            average_production,
                            2
                        ),

                        "average_temperature": round(
                            average_temperature,
                            2
                        ),

                        "average_rainfall": round(
                            average_rainfall,
                            2
                        ),

                        "average_fuel_consumption": round(
                            average_fuel,
                            2
                        ),

                        "average_equipment_utilization": round(
                            average_utilization,
                            2
                        ),
                    },

                    "latest_data": latest_data,

                    "historical_data": historical_data,
                },

                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =========================================================
# SUSTAINABILITY INSIGHTS
# =========================================================

class SustainabilityInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            records = MiningData.objects.all().order_by(
                "production_date"
            )

            # -----------------------------------------
            # NO DATA
            # -----------------------------------------

            if not records.exists():

                return Response(
                    {
                        "message": "No mining data available.",
                        "record_count": 0,
                        "insights": {},
                    },
                    status=status.HTTP_200_OK
                )

            # -----------------------------------------
            # RECORD COUNT
            # -----------------------------------------

            record_count = records.count()

            # -----------------------------------------
            # TOTAL WATER
            # -----------------------------------------

            total_water = sum(
                float(record.water_consumption or 0)
                for record in records
            )

            # -----------------------------------------
            # TOTAL PRODUCTION
            # -----------------------------------------

            total_production = sum(
                float(record.phosphate_production or 0)
                for record in records
            )

            # -----------------------------------------
            # TOTAL WASTE
            # -----------------------------------------

            total_waste = sum(
                float(record.waste_generated or 0)
                for record in records
            )

            # -----------------------------------------
            # AVERAGE EQUIPMENT UTILIZATION
            # -----------------------------------------

            average_utilization = (
                sum(
                    float(record.equipment_utilization or 0)
                    for record in records
                )
                / record_count
            )

            # -----------------------------------------
            # AVERAGE TEMPERATURE
            # -----------------------------------------

            average_temperature = (
                sum(
                    float(record.temperature or 0)
                    for record in records
                )
                / record_count
            )

            # -----------------------------------------
            # AVERAGE RAINFALL
            # -----------------------------------------

            average_rainfall = (
                sum(
                    float(record.rainfall or 0)
                    for record in records
                )
                / record_count
            )

            # -----------------------------------------
            # WATER PER PRODUCTION UNIT
            # -----------------------------------------

            if total_production > 0:

                water_per_production_unit = (
                    total_water / total_production
                )

            else:

                water_per_production_unit = 0

            # -----------------------------------------
            # WASTE PER PRODUCTION UNIT
            # -----------------------------------------

            if total_production > 0:

                waste_per_production_unit = (
                    total_waste / total_production
                )

            else:

                waste_per_production_unit = 0

            # -----------------------------------------
            # RESPONSE
            # -----------------------------------------

            return Response(
                {
                    "message": (
                        "Sustainability insights "
                        "generated successfully."
                    ),

                    "record_count": record_count,

                    "insights": {

                        "total_water_consumption": round(
                            total_water,
                            2
                        ),

                        "total_phosphate_production": round(
                            total_production,
                            2
                        ),

                        "total_waste_generated": round(
                            total_waste,
                            2
                        ),

                        "average_equipment_utilization": round(
                            average_utilization,
                            2
                        ),

                        "average_temperature": round(
                            average_temperature,
                            2
                        ),

                        "average_rainfall": round(
                            average_rainfall,
                            2
                        ),

                        "water_per_production_unit": round(
                            water_per_production_unit,
                            4
                        ),

                        "waste_per_production_unit": round(
                            waste_per_production_unit,
                            4
                        ),
                    },
                },

                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )