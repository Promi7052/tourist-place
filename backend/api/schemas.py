# places_app/schemas.py
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

# Schema for an individual Image
class PlaceImageSchema(BaseModel):
    id: int
    image_path: str
    uploaded_at: datetime

    # Crucial config to allow Pydantic to read SQLAlchemy objects natively
    model_config = ConfigDict(from_attributes=True)


# Schema for creating a new Place (What the frontend sends)
class PlaceCreateSchema(BaseModel):
    name: str
    location: str
    country: str
    description: Optional[str] = None
    image_paths: list[str] = []

class PlaceUpdateSchema(BaseModel):
    # Setting the default to None means these fields are no longer required
    name: str | None = Field(default=None, min_length=1)
    location: str | None = None
    country: str | None = None
    description: str | None = None
    image_paths: list[str] = []

# Schema for returning a Place (What we send back to the frontend)
class PlaceResponseSchema(BaseModel):
    id: int
    name: str
    location: str
    country: str
    description: Optional[str] = None
    created_at: datetime
    
    # Nesting the image schema to automatically serialize the relationship!
    image_paths: List[str] = []

    model_config = ConfigDict(from_attributes=True)