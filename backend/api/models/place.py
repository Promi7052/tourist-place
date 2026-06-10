


from datetime import datetime
from typing import List, Optional
from sqlalchemy import ARRAY, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from user_management.models.user import User


class Place(Base):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_paths: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)

    created_by: Mapped["User"] = relationship("User")

    def __repr__(self) -> str:
        return f"<Place(name={self.name!r}, country={self.country!r})>"
