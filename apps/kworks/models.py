from django.conf import settings
from django.db import models

from apps.catalog.models import Category
from apps.core.models import Currency, TimeStampedUUIDModel


class KworkStatus(models.TextChoices):
    DRAFT = "draft", "Qoralama"
    ACTIVE = "active", "Aktiv"
    PAUSED = "paused", "Pauzada"
    DELETED = "deleted", "O'chirilgan"

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


class KworkImage(TimeStampedUUIDModel):
    kwork = models.ForeignKey(Kwork, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="kworks/images/")
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]
        verbose_name = "Kwork Image"

    def __str__(self) -> str:
        return f"{self.kwork.title} - Image {self.sort_order}"


class KworkFAQ(TimeStampedUUIDModel):
    kwork = models.ForeignKey(Kwork, on_delete=models.CASCADE, related_name="faqs")
    question = models.CharField(max_length=500)
    answer = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]
        verbose_name = "Kwork FAQ"
        verbose_name_plural = "Kwork FAQs"

    def __str__(self) -> str:
        return f"{self.kwork.title} - FAQ {self.sort_order}"


class Favorite(TimeStampedUUIDModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites"
    )
    kwork = models.ForeignKey(Kwork, on_delete=models.CASCADE, related_name="favorites")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Favorite"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "kwork"], name="unique_favorite_per_user"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.user.username} - {self.kwork.title}"
