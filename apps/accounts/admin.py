from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import SellerProfile, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "phone", "city", "is_seller", "is_staff")
    list_filter = ("is_seller", "is_staff")
    search_fields = ("username", "email", "phone")
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Marketplace", {"fields": ("phone", "avatar", "city", "is_seller")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("Marketplace", {"fields": ("email", "phone", "city", "is_seller")}),
    )


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ("display_name", "user", "status", "rating", "completed_orders")
    list_filter = ("status",)
    search_fields = ("display_name", "user__username", "user__email")
    readonly_fields = ("created_at", "updated_at")
