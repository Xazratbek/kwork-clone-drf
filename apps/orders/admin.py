from django.contrib import admin

from .models import Delivery, Order, OrderMessage, OrderEvent, RevisionRequest, MessageAttachment


# class OrderRequirementInline(admin.TabularInline):
#     model = OrderRequirement
#     extra = 0


class OrderEventInline(admin.TabularInline):
    model = OrderEvent
    extra = 0
    readonly_fields = ("created_at",)


class OrderMessageInline(admin.TabularInline):
    model = OrderMessage
    extra = 0


class DeliveryInline(admin.TabularInline):
    model = Delivery
    extra = 0


class MessageAttachmentInline(admin.TabularInline):
    model = MessageAttachment
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("title_snapshot", "buyer", "seller", "status", "price_minor", "currency", "created_at")
    list_filter = ("status", "currency", "created_at")
    search_fields = ("title_snapshot", "buyer__username", "seller__username")
    readonly_fields = ("created_at", "updated_at")
    inlines = [OrderEventInline, OrderMessageInline, DeliveryInline]


@admin.register(OrderMessage)
class OrderMessageAdmin(admin.ModelAdmin):
    list_display = ("order", "sender", "created_at")
    search_fields = ("order__title_snapshot", "sender__username", "body")
    inlines = [MessageAttachmentInline]


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ("order", "created_at")
    search_fields = ("order__title_snapshot", "message")


@admin.register(OrderEvent)
class OrderEventAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "event_type", "actor", "created_at")
    list_filter = ("event_type", "created_at")
    search_fields = ("order__title_snapshot",)


@admin.register(RevisionRequest)
class RevisionRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "buyer", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("order__title_snapshot", "buyer__username")


# @admin.register(OrderRequirement)
# class OrderRequirementAdmin(admin.ModelAdmin):
#     list_display = ("id", "order", "created_at")
#     search_fields = ("order__title_snapshot",)


@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    list_display = ("id", "message", "filename", "size", "created_at")
    search_fields = ("filename",)
