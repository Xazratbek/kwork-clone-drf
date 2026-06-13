from django.contrib import admin

from .models import Kwork


@admin.register(Kwork)
class KworkAdmin(admin.ModelAdmin):
    list_display = ("title", "seller", "category", "price_minor", "currency", "delivery_days", "status")
    list_filter = ("status", "currency", "category")
    search_fields = ("title", "description", "seller__username", "seller__email")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")
