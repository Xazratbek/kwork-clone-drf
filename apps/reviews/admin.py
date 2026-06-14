from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "buyer", "seller", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("order__id", "buyer__username", "seller__username", "comment")
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Order & users", {"fields": ("order", "buyer", "seller")}),
        ("Review", {"fields": ("rating", "comment")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )
