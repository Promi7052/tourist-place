import pytest
from rest_framework import status


@pytest.mark.django_db
class TestSignupAPIView:
    def test_signup_creates_user(self, api_client):
        response = api_client.post(
            "/auth/signup",
            {
                "name": "Jane Doe",
                "email": "jane@example.com",
                "password": "securepass1",
                "role": "user",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == "jane@example.com"
        assert response.data["name"] == "Jane Doe"
        assert response.data["role"] == "user"
        assert "id" in response.data

    def test_signup_rejects_duplicate_email(self, api_client, test_user):
        response = api_client.post(
            "/auth/signup",
            {
                "name": "Duplicate",
                "email": test_user.email,
                "password": "securepass1",
                "role": "user",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


@pytest.mark.django_db
class TestLoginAPIView:
    def test_login_with_valid_credentials(self, api_client, test_user):
        response = api_client.post(
            "/auth/login",
            {"email": test_user.email, "password": "password123"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "access_token" in response.data
        assert response.data["token_type"] == "Bearer"
        assert response.data["user"]["email"] == test_user.email

    def test_login_with_invalid_password(self, api_client, test_user):
        response = api_client.post(
            "/auth/login",
            {"email": test_user.email, "password": "wrongpassword"},
            format="json",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["detail"] == "Invalid credentials"

    def test_login_with_unknown_email(self, api_client):
        response = api_client.post(
            "/auth/login",
            {"email": "nobody@example.com", "password": "password123"},
            format="json",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["detail"] == "Invalid credentials"
