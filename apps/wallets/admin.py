from django.contrib import admin

from .models import (
    Dispute,
    DisputeMessage,
    RefundRequest,
    Wallet,
    WalletTransaction,
    WithdrawalRequest,
)


class DisputeMessageInline(admin.TabularInline):
    model = DisputeMessage
    extra = 0
    readonly_fields = ("created_at",)


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "balance", "escrow_balance", "created_at")
    search_fields = ("user__username", "user__email")
    readonly_fields = ("created_at", "updated_at")


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "wallet", "amount", "type", "order", "created_at")
    list_filter = ("type", "created_at")
    search_fields = ("wallet__user__username", "reference_id", "order__id")
    readonly_fields = ("created_at",)


@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "amount", "method", "status", "created_at")
    list_filter = ("status", "method", "created_at")
    search_fields = ("user__username", "user__email", "phone_number")
    readonly_fields = ("created_at", "updated_at", "completed_at")


@admin.register(RefundRequest)
class RefundRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("order__id",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "opened_by", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("order__id", "opened_by__username")
    readonly_fields = ("created_at", "updated_at", "resolved_at")
    inlines = [DisputeMessageInline]


@admin.register(DisputeMessage)
class DisputeMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "dispute", "sender", "created_at")
    list_filter = ("created_at",)
    search_fields = ("dispute__id", "sender__username", "body")
    readonly_fields = ("created_at",)
