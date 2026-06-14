from rest_framework import status, serializers
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    class Meta:
        model = Category
        fields = ['id', 'parent', 'name', 'slug', 'is_active', 'sort_order', 'children']
        read_only_fields = ['slug']

    def get_children(self, obj):
        if obj.children.exists():
            children_queryset = obj.children.all()
            serializer = CategorySerializer(children_queryset, many=True, context=self.context)
            return serializer.data
