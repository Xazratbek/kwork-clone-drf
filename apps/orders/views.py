from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from .serializers import OrderCreateSerializer, OrderSerializer, OrderUpdateSerializer, OrderDeliverySerializer
from .models import  OrderStatus, Order, OrderMessage, OrderEvent, EventType
from .utility import send_message
from .permissions import IsOrderBuyer, IsOrderParticipant
from django.shortcuts import get_object_or_404
from apps.kworks.models import Kwork, KworkStatus
from apps.kworks.permissions import IsSeller
from django.db import transaction




class OrderCreateApiView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        kwork = get_object_or_404(Kwork, pk = serializer.validated_data['kwork'])
        if kwork.status != KworkStatus.ACTIVE:
            raise ValidationError(detail="Bu kwork aktiv emas")
        if kwork.seller ==  request.user:
            raise ValidationError(detail="Siz o'zingizni kworkingizga zakaz bera olmaysiz")
        

        with transaction.atomic():
            order = serializer.save(
                buyer=request.user, 
                seller = kwork.seller, 
                title_snapshot = kwork.title, 
                price_minor = kwork.price_minor, 
                status = OrderStatus.NEW
                )
            
            send_message(order=order, sender = request.user, msg = "Sizga zakaz tushdi")
            OrderEvent.objects.create(order = order, event_type = EventType.CREATED, actor = request.user, description = "Yangi zakaz yaratilindi")
            return Response(OrderCreateSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListApiView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
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
    

class OrderDetailApiView(RetrieveAPIView):
    permission_classes = [IsOrderParticipant, IsAdminUser]
    serializer_class = OrderSerializer
    queryset = Order.objects.all()
    lookup_field = id
    lookup_url_kwarg = 'uuid'


class BuyerOrderUpdateApiView(APIView):
    permission_classes = [IsOrderBuyer]

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
            order.save()
            return Response({"message":"Zakaz qabul qilindi"})
        
        if status == "rejected" and order.status == OrderStatus.NEW:
            order.status = status
            order.save()
            return Response({"message":"Zakaz qaytarildi"})
        
        
class OrderDeliveryApiView(APIView):
    permission_classes = [IsSeller]

    def post(self, request):
        serializer = serializer = OrderDeliverySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order =  serializer.validated_data["order"]
        
        if order.seller != request.user:
            raise ValidationError("Bu sizning zakazingiz emas")

        if order.status != OrderStatus.IN_PROGRESS:
            raise ValidationError(" Faqat statusi in_progeress bo'lgan zakazlarni topshirishingiz mumkin")
        
        order.status = OrderStatus.DELIVERED
        order.save()
        serializer.save()
        send_message(order=order, sender=request.user, msg="Zakazingiz bajarildim marhamat tanishib chiqing!")
        return Response(serializer.data, status=status.HTTP_201_CREATED)



   











