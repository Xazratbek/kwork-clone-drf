from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from .models import SellerProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    seller_profile = serializers.SerializerMethodField()

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
            "seller_profile",
        )
        read_only_fields = ("id", "is_seller", "seller_profile")

    def get_seller_profile(self, user):
        profile = getattr(user, "seller_profile", None)
        if not profile:
            return None
        return {
            "display_name": profile.display_name,
            "bio": profile.bio,
            "status": profile.status,
            "rating": str(profile.rating),
            "completed_orders": profile.completed_orders,
        }


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("username", "email", "password", "first_name", "last_name", "phone", "city")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
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
