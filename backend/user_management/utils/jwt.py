import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings

# Configuration parameters
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Token lasts 1 hour

def create_access_token(user_id: int, role: str) -> str:
    """Generates a secure JWT string containing user metadata."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "sub": str(user_id),  # 'sub' is the industry standard key for User ID
        "role": role,
        "exp": expire
    }
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Decodes a JWT string. Returns the payload dict if valid, or None if expired/corrupted."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None