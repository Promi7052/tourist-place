from unittest.mock import MagicMock

from user_management.services import AuthenticatedUser
from user_management.utils.permissions import IsCreatorOrReadOnly

from tests.factories import PlaceFactory, UserFactory


class TestIsCreatorOrReadOnly:
    def setup_method(self):
        self.permission = IsCreatorOrReadOnly()

    def test_allows_safe_methods_for_anyone(self):
        request = MagicMock(method="GET", user=None)
        place = PlaceFactory.build()

        assert self.permission.has_object_permission(request, None, place) is True

    def test_denies_write_for_unauthenticated_user(self):
        request = MagicMock(method="PUT", user=None)
        creator = UserFactory.build(id=1)
        place = PlaceFactory.build(created_by=creator, created_by_id=creator.id)

        assert self.permission.has_object_permission(request, None, place) is False

    def test_denies_write_for_non_creator(self):
        request = MagicMock(
            method="DELETE",
            user=AuthenticatedUser(user_id=2, email="other@example.com", role="user"),
        )
        creator = UserFactory.build(id=1)
        place = PlaceFactory.build(created_by=creator, created_by_id=creator.id)

        assert self.permission.has_object_permission(request, None, place) is False

    def test_allows_write_for_creator(self):
        creator = UserFactory.build(id=1, email="creator@example.com")
        request = MagicMock(
            method="PUT",
            user=AuthenticatedUser(
                user_id=creator.id, email=creator.email, role="user"
            ),
        )
        place = PlaceFactory.build(created_by=creator, created_by_id=creator.id)

        assert self.permission.has_object_permission(request, None, place) is True
