from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    # ✅ FIX reverse accessor clash
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='api_user_set',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='api_user_permissions_set',
        blank=True,
    )
