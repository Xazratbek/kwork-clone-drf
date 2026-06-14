from .models import Kwork
from django_filters.rest_framework import filters

class KworkFilter(filters.FilterSet):
    price_min = filters.NumberFilter(field_name="price_minor", lookup_expr='gte')
    price_max = filters.NumberFilter(field_name="price_minor", lookup_expr='lte')

    class Meta:
        model = Kwork
        fields = ['category', 'currency','price_minor']