from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .serializers import OrderCreateSerializer, OrderSerializer, OrderUpdateSerializer, OrderDeliverySerializer
from .models import  OrderStatus, Order, OrderMessage
from .utility import send_message
from .permissions import IsBuyer
from django.shortcuts import get_object_or_404
from apps.kworks.models import Kwork, KworkStatus
from apps.kworks.permissions import IsSeller

class OrderCreateApiView(APIView):
    permission_classes = [IsBuyer]

    def post(self, request, k_id):
        kwork = get_object_or_404(Kwork, pk = k_id)
        if kwork.status != KworkStatus.ACTIVE:
            raise ValidationError("Bu kwork aktiv emas")
        if kwork.seller ==  request.user:
            raise ValidationError("Siz o'zingizni kworkingizga zakaz bera olmaysiz")

        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = serializer.save(
            buyer=request.user, 
            seller = kwork.seller, 
            title_snapshot = kwork.title, 
            price_minor = kwork.price_minor, 
            status = OrderStatus.NEW
            )
        
        send_message(order=order, seller = request.user, msg = "Sizga zakaz tushdi")
        return Response(OrderCreateSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListApiView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.is_seller:
            my_orders = Order.objects.filter(seller = request.user)
        else:
            my_orders = Order.objects.filter(buyer = request.user)
        
        if not my_orders.exists():
            return Response({
                "message":"Zakaz topilmadi"
            })
        
        serializer = OrderSerializer(my_orders, many = True)

        return Response(serializer.data)
    

class BuyerOrderUpdateApiView(APIView):
    permission_classes = [IsBuyer]

    def patch(self, request, order_id):
        order = get_object_or_404(Order, pk = order_id, buyer = request.user)

        if order.status != OrderStatus.NEW:
            raise ValidationError("Bu zakazni o'zgartira olmaysiz")
        
        serializer = OrderUpdateSerializer(order, data = request.data, partial = True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
        

class SellerOrderConfirmOrRejectApiView(APIView):
    permission_classes = [IsSeller]

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk = order_id, seller = request.user)
        
        status = request.data.get("status", "")
        
        if status == "in_progress" and order.status != OrderStatus.NEW:
            raise ValidationError("Faqat statusi New bo'lgan zakazlarni qabul qilishingiz mumkin")
        if status == "rejected" and order.status != OrderStatus.NEW:
            raise ValidationError("Faqat statusi New bo'lgan zakazlarni qaytarishingiz mumkin")
        
        if status == "in_progress" and order.status == OrderStatus.NEW:
            order.status = status

            return Response({"message":"Zakaz qabul qilindi"})
        
        if status == "rejected" and order.status == OrderStatus.NEW:
            order.status = status
            return Response({"message":"Zakaz qaytarildi"})
        
        
class OrderDeliveryApiView(APIView):
    permission_classes = [IsSeller]

    def post(self, request):
        serializer = serializer = OrderDeliverySerializer(data=request.data)
        order_id =  serializer.validated_data["order_id"]

        order = get_object_or_404(Order, pk = order_id, seller = request.user)
        if order.status != OrderStatus.IN_PROGRESS:
            raise ValidationError(" Faqat statusi in_progeress bo'lgan zakazlarni topshirishingiz mumkin")\
            
        serializer.is_valid(raise_exception=True)
        order_delivery = serializer.save()
        order_message = OrderMessage(
            order = order_delivery,
            sender = request.user,
            body = "Zakazingiz bajarildi, marhamat tanishib chiqing! "
        )
        order_message.save()
        
   











