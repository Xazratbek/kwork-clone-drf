from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.orders.models import Order


class Review(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="review")
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_given",
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_received",
    )
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        unique_together = ("order", "buyer", "seller")

    def __str__(self) -> str:
        return f"Review by {self.buyer} for {self.seller} — {self.rating}★"
