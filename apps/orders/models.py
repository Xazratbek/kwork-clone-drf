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
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_messages")
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


class EventType(models.TextChoices):
    CREATED = "created", "Created"
    PAID = "paid", "Paid"
    ACCEPTED = "accepted", "Accepted"
    DELIVERED = "delivered", "Delivered"
    REVISION_REQUESTED = "revision_requested", "Revision Requested"
    COMPLETED = "completed", "Completed"
    CANCELED = "canceled", "Canceled"
    DISPUTED = "disputed", "Disputed"


class OrderEvent(TimeStampedUUIDModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="events")
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_events",
    )
    description = models.TextField(blank=True)
    metadata = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Order Event"

    def __str__(self) -> str:
        return f"{self.order} - {self.event_type}"


class RevisionRequest(TimeStampedUUIDModel):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("resolved", "Resolved"),
        ("canceled", "Canceled"),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="revision_requests")
    delivery = models.ForeignKey(
        Delivery,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="revision_requests",
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="revision_requests",
    )
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Revision Request"

    def __str__(self) -> str:
        return f"Revision for {self.order} ({self.status})"


class OrderRequirement(TimeStampedUUIDModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_requirements")
    question = models.TextField()
    answer_text = models.TextField(blank=True)
    file = models.FileField(upload_to="order_requirements/", null=True, blank=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Order Requirement"

    def __str__(self) -> str:
        return f"Requirement for {self.order}"


class MessageAttachment(TimeStampedUUIDModel):
    message = models.ForeignKey(OrderMessage, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="message_attachments/")
    filename = models.CharField(max_length=255)
    size = models.PositiveIntegerField(default=0, help_text="File size in bytes")
    content_type = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Message Attachment"

    def __str__(self) -> str:
        return self.filename
