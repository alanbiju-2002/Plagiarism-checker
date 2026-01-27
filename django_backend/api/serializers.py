from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=(('student', 'student'), ('teacher', 'teacher'), ('admin', 'admin')), write_only=True, required=False, default='student')

    class Meta:
        model = User
        fields = ("username", "email", "password", "role")

    def create(self, validated_data):
        role = validated_data.pop('role', 'student')
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
        )
        # Map role to Django user flags if appropriate
        if role == 'admin':
            user.is_staff = True
            user.is_superuser = True
            user.save()
        # Attach role attribute for use in responses; not persisted on default User
        setattr(user, 'role', role)
        return user
