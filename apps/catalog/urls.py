from django.urls import path
from .views import CategoryListAPIView

urlpatterns = [
    path('category-list/', CategoryListAPIView.as_view(), name='category-list'),
]
