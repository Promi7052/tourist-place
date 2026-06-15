import pytest
from rest_framework import status

from user_management.utils.jwt import create_access_token


@pytest.mark.django_db
class TestPlaceListAPIView:
    def test_list_places_is_public(self, api_client, test_place):
        response = api_client.get("/api/place")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["total_count"] == 1
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["name"] == test_place.name

    def test_create_place_requires_authentication(self, api_client):
        response = api_client.post(
            "/api/place",
            {
                "name": "Colosseum",
                "location": "Rome",
                "country": "Italy",
                "description": "Ancient amphitheatre",
                "image_paths": [],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_place_with_valid_token(self, api_client, test_user, auth_headers):
        response = api_client.post(
            "/api/place",
            {
                "name": "Colosseum",
                "location": "Rome",
                "country": "Italy",
                "description": "Ancient amphitheatre",
                "image_paths": ["/images/colosseum.jpg"],
            },
            format="json",
            **auth_headers,
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "Colosseum"
        assert response.data["country"] == "Italy"

    def test_create_place_rejects_invalid_payload(self, api_client, auth_headers):
        response = api_client.post(
            "/api/place",
            {"name": "Incomplete"},
            format="json",
            **auth_headers,
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestPlaceDetailAPIView:
    def test_get_place_by_id(self, api_client, test_place):
        response = api_client.get(f"/api/places/{test_place.id}/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == test_place.id
        assert response.data["country"] == test_place.country

    def test_get_missing_place_returns_404(self, api_client):
        response = api_client.get("/api/places/99999/")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_place_by_creator(self, api_client, test_place, auth_headers):
        response = api_client.put(
            f"/api/places/{test_place.id}/",
            {"name": "Updated Name"},
            format="json",
            **auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Updated Name"

    def test_update_place_by_non_creator_forbidden(
        self, api_client, test_place, other_user
    ):
        token = create_access_token(user_id=other_user.id, role=other_user.role.value)
        response = api_client.put(
            f"/api/places/{test_place.id}/",
            {"name": "Hijacked"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_place_by_creator(self, api_client, test_place, auth_headers):
        response = api_client.delete(f"/api/places/{test_place.id}/", **auth_headers)

        assert response.status_code == status.HTTP_204_NO_CONTENT

        get_response = api_client.get(f"/api/places/{test_place.id}/")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
