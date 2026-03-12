from django.urls import path
from .views import RegisterView, LoginView
from .plagiarism_views import PlagiarismCheckView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("check-plagiarism/", PlagiarismCheckView.as_view(), name="check_plagiarism"),
]
