from rest_framework.serializers import ModelSerializer
from .models import Order, OrderMessage, OrderStatus, Delivery
from rest_framework import serializers
from apps.kworks.serializers import KworkListSerializer




class OrderCreateSerializer(ModelSerializer):
    class Meta:
        model = Order
        fields = ['kwork', 'requirements']


class OrderSerializer(ModelSerializer):
    buyer_username = serializers.CharField(source = 'buyer.username')
    seller_username = serializers.CharField(source = 'seller.username')
    kwork = KworkListSerializer()
    class Meta:
        model = Order
        fields = ['buyer_username', 'seller_username', 'kwork', 'title_snapshot', 'price_minor',\
                   'currency', 'requirements', 'status' ]

class OrderUpdateSerializer(ModelSerializer):
    class Meta:
        model = Order
        fields = ['price_minor', 'currency', 'requirements']


class OrderStatusUpdateSerializer(ModelSerializer):
    model = Order
    fields = ["status"]


class OrderDeliverySerializer(ModelSerializer):
    model = Delivery
    field = ['order_id', 'message', 'file']

    

