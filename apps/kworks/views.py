from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from .serializers import KworkCreateSerializer
from .models import Kwork
from .permissions import IsSeller


class KworkCreateView(CreateAPIView):
    permission_classes = IsSeller
    serializer_class = KworkCreateSerializer

    def perform_create(self, serializer):
        return serializer.save(seller=self.request.user)