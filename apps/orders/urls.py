from django.urls import path

from .views import (
    BuyerOrderUpdateApiView,
    OrderCreateApiView,
    OrderDeliveryApiView,
    OrderListApiView,
    SellerOrderConfirmOrRejectApiView,
)

urlpatterns = [
    path("", OrderListApiView.as_view(), name="order-list"),
    path("<uuid:order_id>/", BuyerOrderUpdateApiView.as_view(), name="order-detail"),
    path("<uuid:order_id>/confirm/", SellerOrderConfirmOrRejectApiView.as_view(), name="order-confirm"),
    path("<uuid:order_id>/deliver/", OrderDeliveryApiView.as_view(), name="order-deliver"),
    path("kworks/<uuid:k_id>/order/", OrderCreateApiView.as_view(), name="order-create"),
]
