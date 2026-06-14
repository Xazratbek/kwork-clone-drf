from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedUUIDModel


class Project(TimeStampedUUIDModel):
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled')
    )

    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project'

    def __str__(self):
        return self.title


class ProjectBid(TimeStampedUUIDModel):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn')
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='bids')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_bids')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    message = models.TextField()
    delivery_days = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project Bid'
        constraints = [
            models.UniqueConstraint(fields=['project', 'seller'], name='unique_bid_per_seller')
        ]

    def __str__(self):
        return f"Bid by {self.seller} on {self.project.title}"
