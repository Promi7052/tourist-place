from django.urls import path

from user_management.views import LoginAPIView, SignupAPIView


urlpatterns = [
    path("login", LoginAPIView.as_view(), name="login_api"),
    path("signup", SignupAPIView.as_view(), name="signup")
]