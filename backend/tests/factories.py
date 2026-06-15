import factory
from factory.alchemy import SQLAlchemyModelFactory

from api.models import Place
from user_management.models.user import User, UserRole
from user_management.services import hash_password


class UserFactory(SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session_persistence = "commit"

    class Params:
        plain_password = "password123"

    name = factory.Faker("name")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    hashed_password = factory.LazyAttribute(
        lambda obj: hash_password(obj.plain_password)
    )
    role = UserRole.USER


class PlaceFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Place
        sqlalchemy_session_persistence = "commit"

    name = factory.Faker("city")
    location = factory.Faker("city")
    country = factory.Faker("country")
    description = factory.Faker("paragraph", nb_sentences=2)
    image_paths = factory.LazyFunction(lambda: ["/images/place.jpg"])
    created_by = factory.SubFactory(UserFactory)
