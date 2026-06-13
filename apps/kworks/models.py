from django.conf import settings
from django.db import models

from apps.catalog.models import Category
from apps.core.models import Currency, TimeStampedUUIDModel


class KworkStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    ACTIVE = "active", "Active"
    PAUSED = "paused", "Paused"


class Kwork(TimeStampedUUIDModel):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="kworks")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="kworks")
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=220)
    description = models.TextField()
    price_minor = models.DecimalField(max_digits=10,decimal_places=2)
    currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.USD)
    delivery_days = models.PositiveIntegerField(default=1)
    image = models.ImageField(upload_to="kworks/", null=True, blank=True)
    status = models.CharField(max_length=16, choices=KworkStatus.choices, default=KworkStatus.DRAFT)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["seller", "slug"], name="unique_kwork_slug_per_seller"),
        ]

    def __str__(self) -> str:
        return self.title
