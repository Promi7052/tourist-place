from datetime import datetime
import enum
from typing import Optional
from django.db import models
from sqlalchemy import DateTime, Enum as SQLEnum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base

class UserRole(enum.Enum):
    USER = "user"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

