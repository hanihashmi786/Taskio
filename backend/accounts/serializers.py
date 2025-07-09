from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'avatar']  # Add 'avatar' field to your User model if not present
        read_only_fields = ['email']  # Usually you do not allow email change
