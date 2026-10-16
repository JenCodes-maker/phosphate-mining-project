from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import MiningData
from .serializers import MiningDataSerializer


class MiningDataListCreateView(generics.ListCreateAPIView):
    queryset = MiningData.objects.all()
    serializer_class = MiningDataSerializer
    permission_classes = [IsAuthenticated]
    
class MiningDataDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MiningData.objects.all()
    serializer_class = MiningDataSerializer
    permission_classes = [IsAuthenticated]