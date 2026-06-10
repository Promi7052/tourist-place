from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

from user_management.models.user import UserRole


class UserRegisterSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="A valid email address")
    password: str = Field(..., min_length=8, max_length=100, description="Raw password string")
    role: str = UserRole.USER.value

    @field_validator("role", mode="before")
    @classmethod
    def validate_and_fallback_role(cls, value):
        """
        Intercepts the role string. If it's invalid, it cleanly falls back
        to 'user' instead of triggering a 400 Bad Request error.
        """
        # Collect all valid values: {"user", "admin", "moderator"}
        valid_roles = {item.value for item in UserRole}
        
        if value not in valid_roles:
            return UserRole.USER.value # Force fallback to default string
            
        return value



class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str



class UserResponseSchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    # Enables compatibility with your SQLAlchemy model instances
    model_config = {"from_attributes": True}


class LoginResponseSchema(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: UserResponseSchema