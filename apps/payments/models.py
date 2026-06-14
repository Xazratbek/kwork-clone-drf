from django.db import models

from apps.orders.models import Order


class Payment(models.Model):
    PROVIDER_CHOICES = (
        ("click", "Click"),
        ("payme", "Payme"),
        ("mock", "Mock Payment"),
    )

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    )

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    transaction_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    provider_response = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self) -> str:
        return f"Payment {self.pk} — order {self.order_id} ({self.status})"


class Escrow(models.Model):
    STATUS_CHOICES = (
        ("held", "Held"),
        ("released", "Released"),
        ("refunded", "Refunded"),
    )

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="escrow")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="held")
    held_at = models.DateTimeField(auto_now_add=True)
    released_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Escrow"
        verbose_name_plural = "Escrows"

    def __str__(self) -> str:
        return f"Escrow {self.pk} — order {self.order_id} ({self.status})"
