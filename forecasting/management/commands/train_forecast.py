from django.core.management.base import BaseCommand

from forecasting.ml_model import (
    train_forecasting_model
)


class Command(BaseCommand):

    help = (
        "Train the Ridge Regression "
        "water requirement forecasting model"
    )

    def handle(
        self,
        *args,
        **kwargs
    ):

        self.stdout.write(
            self.style.WARNING(
                "\nStarting Ridge Regression "
                "water forecasting model training..."
            )
        )

        try:

            train_forecasting_model()

            self.stdout.write(
                self.style.SUCCESS(
                    "\nRidge Regression model "
                    "trained successfully!"
                )
            )

        except Exception as e:

            self.stdout.write(
                self.style.ERROR(
                    f"\nModel training failed: {e}"
                )
            )