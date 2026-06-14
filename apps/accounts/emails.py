import secrets
import logging
from datetime import timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import EmailVerification

logger = logging.getLogger(__name__)


def create_email_verification(user):
    return EmailVerification.objects.create(
        user=user,
        token=secrets.token_urlsafe(32),
        expires_at=timezone.now() + timedelta(hours=24),
    )


def send_verification_email(user):
    verification = create_email_verification(user)
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    verify_url = f"{frontend_url}/verify-email?{urlencode({'token': verification.token})}"

    try:
        send_mail(
            subject="Emailingizni tasdiqlang",
            message=f"Emailingizni tasdiqlash uchun link: {verify_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Verification email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
        # Development uchun - email yuborilmaganda ham continue qilsin
        if not settings.DEBUG:
            raise

    return verification
