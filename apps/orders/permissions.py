from rest_framework.permissions import BasePermission

from .models import Order


class IsOrderParticipant(BasePermission):
    """Allow only an order's buyer, seller, or staff users."""

    def _is_staff(self, user):
        return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))

    def _get_order_id(self, view):
        return view.kwargs.get("order_id") or view.kwargs.get("pk") or view.kwargs.get("id")

    def _user_filter(self, user):
        return {"buyer": user} | {"seller": user}

    def _is_allowed_user(self, user, order):
        return order.buyer_id == user.id or order.seller_id == user.id

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False

        if self._is_staff(user):
            return True

        order_id = self._get_order_id(view)
        if not order_id:
            return True

        return Order.objects.filter(pk=order_id).filter(
            buyer=user
        ).exists() or Order.objects.filter(pk=order_id, seller=user).exists()

    def has_object_permission(self, request, view, obj):
        user = request.user
        if self._is_staff(user):
            return True
        return bool(user and user.is_authenticated and self._is_allowed_user(user, obj))


class IsOrderBuyer(IsOrderParticipant):
    """Allow only an order's buyer or staff users."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False

        if self._is_staff(user):
            return True

        order_id = self._get_order_id(view)
        if not order_id:
            return True

        return Order.objects.filter(pk=order_id, buyer=user).exists()

    def has_object_permission(self, request, view, obj):
        user = request.user
        if self._is_staff(user):
            return True
        return bool(user and user.is_authenticated and obj.buyer_id == user.id)


class IsOrderSeller(IsOrderParticipant):
    """Allow only an order's seller or staff users."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False

        if self._is_staff(user):
            return True

        order_id = self._get_order_id(view)
        if not order_id:
            return True

        return Order.objects.filter(pk=order_id, seller=user).exists()

    def has_object_permission(self, request, view, obj):
        user = request.user
        if self._is_staff(user):
            return True
        return bool(user and user.is_authenticated and obj.seller_id == user.id)


class IsBuyer(IsOrderBuyer):
    pass
