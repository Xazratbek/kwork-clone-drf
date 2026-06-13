from django.conf import settings
from django.db import models

from apps.core.models import Currency, TimeStampedUUIDModel
from apps.kworks.models import Kwork


class OrderStatus(models.TextChoices):
    NEW = "new", "New"
    IN_PROGRESS = "in_progress", "In progress"
    DELIVERED = "delivered", "Delivered"
    COMPLETED = "completed", "Completed"
    CANCELED = "canceled", "Canceled"
    REJECTED = "rejected", "Rejected"

class Order(TimeStampedUUIDModel):
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="buyer_orders")
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seller_orders")
    kwork = models.ForeignKey(Kwork, on_delete=models.PROTECT, related_name="orders")
    title_snapshot = models.CharField(max_length=220)
    price_minor = models.DecimalField(max_digits=12, decimal_places= 2)
    currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.USD)
    requirements = models.TextField(blank=True)
    status = models.CharField(max_length=24, choices=OrderStatus.choices, default=OrderStatus.NEW)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.title_snapshot} #{self.pk}"


class OrderMessage(TimeStampedUUIDModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="order_messages")
    body = models.TextField()

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.order_id} message"


class Delivery(TimeStampedUUIDModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="deliveries")
    message = models.TextField()
    file = models.FileField(upload_to="deliveries/", null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.order_id} delivery"
