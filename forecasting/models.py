from django.db import models


class ModelTrainingHistory(models.Model):

    model_name = models.CharField(
        max_length=100
    )

    target_variable = models.CharField(
        max_length=100
    )

    training_records = models.IntegerField()

    testing_records = models.IntegerField()

    mae = models.FloatField()

    rmse = models.FloatField()

    r2_score = models.FloatField()

    alpha = models.FloatField(
        default=1.0
    )

    trained_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return (
            f"{self.model_name} - "
            f"{self.trained_at}"
        )