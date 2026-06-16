from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from .models import SellerProfile

User = get_user_model()


class SellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ("display_name", "bio", "status", "rating", "completed_orders")
        read_only_fields = ("status", "rating", "completed_orders")

class UserSerializer(serializers.ModelSerializer):
    seller_profile = SellerProfileSerializer(read_only=True)
    is_email_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "avatar",
            "city",
            "is_seller",
            "is_email_verified",
            "seller_profile",
        )
        read_only_fields = ("id", "email", "is_seller", "is_email_verified", "seller_profile")


class EmailCheckSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, email):
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Bu email bilan user bor.")
        return email


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "password", "username", "first_name", "last_name", "phone", "city")
        extra_kwargs = {"username": {"required": False, "allow_blank": True}}

    def validate_email(self, email):
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Bu email bilan user bor.")
        return email

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data["email"]
        username = validated_data.pop("username", "") or email.split("@")[0]

        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            counter += 1
            username = f"{base_username}{counter}"

        user = User(username=username, **validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    login = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        login = attrs["login"]
        password = attrs["password"]
        username = login

        if "@" in login:
            user = User.objects.filter(email__iexact=login).first()
            username = user.username if user else login

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Login yoki parol noto'g'ri.")
        attrs["user"] = user
        return attrs


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField()


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()


class BecomeSellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ("display_name", "bio")

    def create(self, validated_data):
        user = self.context["request"].user
        user.is_seller = True
        user.save(update_fields=["is_seller"])
        profile, _ = SellerProfile.objects.update_or_create(user=user, defaults=validated_data)
        return profile
