from django.urls import path

from .views import (
    BecomeSellerView,
    EmailCheckView,
    LoginView,
    LogoutView,
    MeView,
    ResendVerificationView,
    SignupView,
    VerifyEmailView,
)

urlpatterns = [
    path("check-email/", EmailCheckView.as_view(), name="check-email"),
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationView.as_view(), name="resend-verification"),
    path("become-seller/", BecomeSellerView.as_view(), name="become-seller"),
]
