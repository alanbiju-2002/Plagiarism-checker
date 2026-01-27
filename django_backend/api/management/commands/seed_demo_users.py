from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create demo users: admin_demo, teacher_demo, student_demo'

    def handle(self, *args, **options):
        users = [
            ('admin_demo', 'admin@example.com', 'Admin123!', 'Demo Admin', 'admin'),
            ('teacher_demo', 'teacher@example.com', 'Teacher123!', 'Demo Teacher', 'teacher'),
            ('student_demo', 'student@example.com', 'Student123!', 'Demo Student', 'student'),
        ]

        for username, email, password, full_name, role in users:
            user, created = User.objects.get_or_create(username=username, defaults={'email': email})
            if created:
                user.set_password(password)
                # store full_name in first_name/last_name
                parts = full_name.split(None, 1)
                user.first_name = parts[0]
                if len(parts) > 1:
                    user.last_name = parts[1]
                if role == 'admin':
                    user.is_staff = True
                    user.is_superuser = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created user {username}'))
            else:
                self.stdout.write(self.style.WARNING(f'User {username} already exists'))

        self.stdout.write(self.style.SUCCESS('Demo users seeding complete.'))
