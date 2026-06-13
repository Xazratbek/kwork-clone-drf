from django.contrib.auth.models import AbstractUser
from django.db import models

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
