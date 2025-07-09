from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Add this line:
    avatar = models.TextField(blank=True, null=True)  # Use TextField for base64 or URL; use ImageField for file uploads
