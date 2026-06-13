from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .emails import send_verification_email
from .models import EmailVerification
from .permissions import IsEmailVerified
from .serializers import *

User = get_user_model()


def jwt_response(user, request):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": UserSerializer(user, context={"request": request}).data,
    }


class EmailCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"available": True})


class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_verification_email(user)
        return Response(jwt_response(user, request), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        return Response(jwt_response(user, request))


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        verification = EmailVerification.objects.select_related("user").filter(
            token=serializer.validated_data["token"],
        ).first()

        if not verification or not verification.is_valid:
            return Response({"detail": "Token yaroqsiz yoki muddati tugagan."}, status=status.HTTP_400_BAD_REQUEST)

        verification.used_at = timezone.now()
        verification.save(update_fields=["used_at"])

        user = verification.user
        user.email_verified_at = timezone.now()
        user.save(update_fields=["email_verified_at"])

        return Response({"detail": "Email tasdiqlandi."})


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data["email"]).first()
        if user and not user.is_email_verified:
            send_verification_email(user)
        return Response({"detail": "Agar email mavjud bo'lsa, tasdiqlash xati yuborildi."})


class BecomeSellerView(generics.CreateAPIView):
    serializer_class = BecomeSellerSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmailVerified]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={"request": request}).data)
