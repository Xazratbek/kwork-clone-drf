from django.urls import path
from .views import OrderCreateApiView

urlpatterns = [
    path("kworks/<uuid:k_id>/order/", OrderCreateApiView.as_view(), name="order-create"),
]