from django.contrib import admin

from .models import Favorite, Kwork, KworkFAQ, KworkImage


class KworkImageInline(admin.TabularInline):
    model = KworkImage
    extra = 1


class KworkFAQInline(admin.TabularInline):
    model = KworkFAQ
    extra = 1


@admin.register(Kwork)
class KworkAdmin(admin.ModelAdmin):
    list_display = ("title", "seller", "category", "price_minor", "currency", "delivery_days", "status")
    list_filter = ("status", "currency", "category")
    search_fields = ("title", "description", "seller__username", "seller__email")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")
    inlines = [KworkImageInline, KworkFAQInline]


@admin.register(KworkImage)
class KworkImageAdmin(admin.ModelAdmin):
    list_display = ("id", "kwork", "is_primary", "sort_order")


@admin.register(KworkFAQ)
class KworkFAQAdmin(admin.ModelAdmin):
    list_display = ("id", "kwork", "question", "sort_order")


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "kwork", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "kwork__title")
