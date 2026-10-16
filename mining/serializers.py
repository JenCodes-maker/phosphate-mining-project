from rest_framework import serializers
from .models import MiningData


class MiningDataSerializer(serializers.ModelSerializer):

    class Meta:
        model = MiningData
        fields = '__all__'