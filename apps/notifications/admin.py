from django.contrib import admin

from .models import DeviceToken, Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "type", "is_read", "created_at")
    list_filter = ("type", "is_read", "created_at")
    search_fields = ("user__username", "user__email", "title", "body")
    readonly_fields = ("created_at", "read_at")


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "email_enabled", "push_enabled", "in_app_enabled", "updated_at")
    search_fields = ("user__username", "user__email")
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("User", {"fields": ("user",)}),
        ("General", {"fields": ("email_enabled", "push_enabled", "in_app_enabled")}),
        (
            "Email",
            {
                "fields": (
                    "email_order_updates",
                    "email_payment_notifications",
                    "email_reviews",
                    "email_messages",
                    "email_disputes",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Push",
            {
                "fields": (
                    "push_order_updates",
                    "push_payment_notifications",
                    "push_messages",
                ),
                "classes": ("collapse",),
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "platform", "is_active", "created_at", "last_used_at")
    list_filter = ("platform", "is_active", "created_at")
    search_fields = ("user__username", "user__email", "token")
    readonly_fields = ("created_at", "updated_at", "last_used_at")
