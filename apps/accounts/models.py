from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

from apps.core.models import TimeStampedUUIDModel


class SellerStatus(models.TextChoices):
    INACTIVE = "inactive", "Inactive"
    ACTIVE = "active", "Active"


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=32, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    city = models.CharField(max_length=120, blank=True)
    is_seller = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)

    @property
    def is_email_verified(self) -> bool:
        return self.email_verified_at is not None

    def __str__(self) -> str:
        return self.username


class SellerProfile(TimeStampedUUIDModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="seller_profile")
    display_name = models.CharField(max_length=150)
    bio = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=SellerStatus.choices, default=SellerStatus.ACTIVE)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    completed_orders = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return self.display_name


class EmailVerification(TimeStampedUUIDModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="email_verifications")
    token = models.CharField(max_length=64, unique=True)
    used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ["-created_at"]

    @property
    def is_valid(self) -> bool:
        return self.used_at is None and self.expires_at > timezone.now()

    def __str__(self) -> str:
        return f"{self.user.email} verification"
