from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView, RetrieveAPIView, get_object_or_404, DestroyAPIView
from rest_framework.views import APIView
from .serializers import KworkCreateSerializer, KworkUpdateSerializer, KworkListSerializer, KworkDetailSerializer
from .models import Kwork, KworkStatus
from .permissions import IsSeller
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .paginations import KworkListPagination
from .filters import KworkFilter

class KworkCreateView(CreateAPIView):
    permission_classes = [IsSeller]
    serializer_class = KworkCreateSerializer

    def perform_create(self, serializer):
        return serializer.save(seller=self.request.user)

class KworkUpdateView(UpdateAPIView):
    permission_classes = [IsSeller]
    serializer_class = KworkUpdateSerializer
    lookup_field = id
    lookup_url_kwarg = 'uuid'
    queryset = Kwork.objects.all().select_related('category','seller')

class KworkDetailView(RetrieveAPIView):
    serializer_class = KworkDetailSerializer
    queryset = Kwork.objects.all().select_related('category','seller')
    lookup_url_kwarg = 'uuid'
    lookup_field = 'id'
    permission_classes = []

class PauseKworkView(APIView):
    permission_classes = [IsSeller]
    def post(self, request,uuid):
        kwork = get_object_or_404(Kwork,id=uuid)
        self.check_object_permissions(request,kwork)
        if (kwork.status != KworkStatus.PAUSED or kwork.status != KworkStatus.DRAFT) and kwork.status == KworkStatus.ACTIVE:
            kwork.status = KworkStatus.PAUSED
            kwork.save()
            return Response(
                {
                    "message":"Kwork paused",
                    "status":status.HTTP_200_OK
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "message":"Kwork xolati active bo'lgandagina pauza qila olasiz",
                "status":status.HTTP_422_UNPROCESSABLE_ENTITY
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY
        )

class ActivateKworkView(APIView):
    permission_classes = [IsSeller]

    def post(self, request, uuid):
        kwork = get_object_or_404(Kwork,id=uuid)
        self.check_object_permissions(request,kwork)
        if kwork.status != KworkStatus.ACTIVE:
            kwork.status = KworkStatus.ACTIVE
            kwork.save()
            return Response(
                {
                    "message":"Kwork activated",
                    "status":status.HTTP_200_OK
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "message":"Kworkni faqat Qoralama yoki Pauza xolatida aktivatsiya qilish mumkin",
                "status":status.HTTP_422_UNPROCESSABLE_ENTITY
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY
        )

class KworkListView(ListAPIView):
    pagination_class = KworkListPagination
    serializer_class = KworkListSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_fields = ['category','currency','delivery_days','price_minor','status']
    search_fields = ['title','description']
    filterset_class = KworkFilter
    ordering = ['-id']
    permission_classes = []

    def get_queryset(self):
        return Kwork.objects.filter(status=KworkStatus.ACTIVE).select_related('seller','category')

class MYKworksView(ListAPIView):
    permission_classes = [IsSeller]
    serializer_class = KworkListSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_fields = ['category','currency','delivery_days','price_minor','status']
    search_fields = ['title','description']
    filterset_class = KworkFilter
    ordering = ['-id']

    def get_queryset(self):
        return Kwork.objects.filter(seller=self.request.user).select_related('category','seller')

class KworkDeleteView(APIView):
    permission_classes = [IsSeller]

    def post(self, request, uuid):
        kwork = get_object_or_404(Kwork,id=uuid)
        # self.check_object_permissions(request,kwork)
        print(kwork)
        print(kwork.seller)
        print(kwork.seller == request.user)
        if kwork.seller == request.user:
            kwork.status = KworkStatus.DELETED
            kwork.save(update_fields=['status','updated_at'])
            return Response(
                {
                    "message":"Kwork o'chirildi",
                    'status':status.HTTP_204_NO_CONTENT,
                },
                status=status.HTTP_204_NO_CONTENT
            )
        else:
            return Response(
                {
                    "message":"Ruhsat yo'q",
                    "status":status.HTTP_403_FORBIDDEN
                },
                status=status.HTTP_403_FORBIDDEN
            )