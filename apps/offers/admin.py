from django.contrib import admin
from .models import CustomOffer

@admin.register(CustomOffer)
class CustomOfferAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'seller', 'buyer', 'price', 'delivery_days', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'seller__username', 'buyer__username')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Participants', {
            'fields': ('seller', 'buyer')
        }),
        ('Offer Details', {
            'fields': ('title', 'description', 'price', 'delivery_days')
        }),
        ('Status', {
            'fields': ('status', 'expires_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
