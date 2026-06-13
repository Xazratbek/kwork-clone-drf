from rest_framework.permissions import BasePermission


class IsBuyer(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.buyer

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
    
