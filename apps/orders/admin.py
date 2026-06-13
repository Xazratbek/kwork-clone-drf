from django.contrib import admin

from .models import Delivery, Order, OrderMessage


class OrderMessageInline(admin.TabularInline):
    model = OrderMessage
    extra = 0


class DeliveryInline(admin.TabularInline):
    model = Delivery
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("title_snapshot", "buyer", "seller", "status", "price_minor", "currency", "created_at")
    list_filter = ("status", "currency", "created_at")
    search_fields = ("title_snapshot", "buyer__username", "seller__username")
    readonly_fields = ("created_at", "updated_at")
    inlines = [OrderMessageInline, DeliveryInline]


@admin.register(OrderMessage)
class OrderMessageAdmin(admin.ModelAdmin):
    list_display = ("order", "sender", "created_at")
    search_fields = ("order__title_snapshot", "sender__username", "body")


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ("order", "created_at")
    search_fields = ("order__title_snapshot", "message")
