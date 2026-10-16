from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):

    ROLE_CHOICES = [
        ('contractor', 'Contractor'),
        ('provision', 'Provision'),
        ('technical', 'Technical Team'),
        ('process', 'Process Unit'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    is_approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"