from django.contrib import admin
from .models import Project, ProjectBid

class ProjectBidInline(admin.TabularInline):
    model = ProjectBid
    extra = 0

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'buyer', 'budget', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'buyer__username', 'description')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ProjectBidInline]
    
    fieldsets = (
        ('Buyer', {
            'fields': ('buyer',)
        }),
        ('Project Details', {
            'fields': ('title', 'description', 'budget', 'deadline')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ProjectBid)
class ProjectBidAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'seller', 'amount', 'delivery_days', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('project__title', 'seller__username', 'message')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Project & Seller', {
            'fields': ('project', 'seller')
        }),
        ('Bid Details', {
            'fields': ('amount', 'delivery_days', 'message')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
