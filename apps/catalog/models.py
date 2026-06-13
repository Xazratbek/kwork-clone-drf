from django.db import models

from apps.core.models import TimeStampedUUIDModel


class Category(TimeStampedUUIDModel):
    parent = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children")
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return self.name
