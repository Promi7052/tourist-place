from contextlib import contextmanager

import pytest
from django.conf import settings
from rest_framework.test import APIClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from core.database import Base
from tests.factories import PlaceFactory, UserFactory
from user_management.utils.jwt import create_access_token


@pytest.fixture(scope="session")
def sqlalchemy_engine():
    engine = create_engine(
        settings.SQLALCHEMY_TEST_DATABASE_URL,
        echo=False,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture
def db_session(sqlalchemy_engine):
    connection = sqlalchemy_engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(autouse=True)
def bind_factories(db_session):
    for factory_class in (UserFactory, PlaceFactory):
        factory_class._meta.sqlalchemy_session = db_session


@pytest.fixture(autouse=True)
def patch_get_db(db_session, monkeypatch):
    @contextmanager
    def _get_db():
        yield db_session

    monkeypatch.setattr("core.database.get_db", _get_db)
    monkeypatch.setattr("user_management.views.get_db", _get_db)
    monkeypatch.setattr("api.views.get_db", _get_db)
    monkeypatch.setattr("user_management.services.get_db", _get_db)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_user():
    return UserFactory(
        name="Test User",
        email="test@example.com",
        plain_password="password123",
    )


@pytest.fixture
def other_user():
    return UserFactory(
        name="Other User",
        email="other@example.com",
        plain_password="password123",
    )


@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(user_id=test_user.id, role=test_user.role.value)
    return {"HTTP_AUTHORIZATION": f"Bearer {token}"}


@pytest.fixture
def test_place(test_user):
    return PlaceFactory(
        name="Eiffel Tower",
        location="Paris",
        country="France",
        description="Iconic landmark",
        image_paths=["/images/eiffel.jpg"],
        created_by=test_user,
    )
