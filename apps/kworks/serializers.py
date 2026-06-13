from rest_framework.serializers import ModelSerializer
from .models import Kwork
from apps.accounts.serializers import UserSerializer

class KworkDetailSerializzer(ModelSerializer):
    seller = UserSerializer(read_only=True)

    class Meta:
        model = Kwork
        fields = ['id','seller','category','title','slug','description','price_minor','currency','delivery_days','image','status']

class KworkListSerializer(ModelSerializer):
    class Meta:
        model = Kwork
        fields = ['id','seller','title','slug','image','price_minor','delivery_days']

class KworkCreateSerializer(ModelSerializer):
    class Meta:
        model = Kwork
        fields = ['__all__']