from django.shortcuts import render, get_object_or_404 
from .models import  Category
from rest_framework.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import CategorySerializer


class CategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.filter(is_active=True).prefetch_related("children")
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    

