from rest_framework.permissions import BasePermission

class IsSeller(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.user

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)