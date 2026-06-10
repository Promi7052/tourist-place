from typing import cast
from django.contrib.auth.hashers import make_password, check_password

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .utils.jwt import decode_access_token
from core.database import get_db
from .models import User


class AuthenticatedUser:
    """A lightweight mock user class to satisfy DRF's request.user expectations."""
    def __init__(self, user_id: int, email: str, role: str):
        self.id = user_id
        self.email = email
        self.role = role
        self.is_authenticated = True


class SQLAlchemyJWTAuthentication(BaseAuthentication):
    """Custom DRF authentication scheme mapping JWTs securely to SQLAlchemy records."""
    
    def authenticate(self, request):
        # 1. Extract the Authorization Header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None  # No token provided, skip to next authentication class or hit permissions

        # 2. Parse out 'Bearer <token>' structural components
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise AuthenticationFailed("Authorization header must be formatted as: Bearer <token>")
            
        token = parts[1]

        # 3. Decode and validate the token string signature
        payload = decode_access_token(token)
        if not payload:
            raise AuthenticationFailed("Invalid or expired authentication token.")

        user_id = int(payload.get("sub", 0))

        # 4. Look up user inside your SQLAlchemy session container
        with get_db() as db:
            db_user = db.query(User).filter(User.id == user_id).first()
            if not db_user:
                raise AuthenticationFailed("User associated with this token no longer exists.")
            
            # Construct a clean user profile object instance
            authenticated_user = AuthenticatedUser(
                user_id=db_user.id,
                email=db_user.email,
                role=db_user.role.value
            )

        # 5. Return the expected DRF payload tuple
        return (authenticated_user, token)

def hash_password(plain_password: str) -> str:
    """
    Hashes a plain-text password securely using Django's PBKDF2 algorithm.
    This creates a one-way cryptographic signature that cannot be reversed.
    """
    return cast(str, make_password(plain_password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compares a plain-text password against a stored hash securely.
    Returns True if they match, False otherwise.
    """
    return check_password(plain_password, hashed_password)