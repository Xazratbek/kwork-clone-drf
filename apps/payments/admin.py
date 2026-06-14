from django.contrib import admin

from .models import Escrow, Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "amount", "provider", "status", "created_at")
    list_filter = ("status", "provider", "created_at")
    search_fields = ("order__id", "transaction_id")
    readonly_fields = ("created_at", "updated_at", "transaction_id")

    fieldsets = (
        ("Order", {"fields": ("order", "amount")}),
        ("Payment", {"fields": ("provider", "status", "transaction_id")}),
        ("Provider response", {"fields": ("provider_response",), "classes": ("collapse",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(Escrow)
class EscrowAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "amount", "status", "held_at", "released_at")
    list_filter = ("status", "held_at")
    search_fields = ("order__id",)
    readonly_fields = ("held_at", "released_at")

    fieldsets = (
        ("Order", {"fields": ("order", "amount")}),
        ("Status", {"fields": ("status",)}),
        ("Timeline", {"fields": ("held_at", "released_at"), "classes": ("collapse",)}),
    )
