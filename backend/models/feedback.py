from typing import Optional
from pydantic import BaseModel, Field

class FeedbackCreate(BaseModel):
    event_id: str
    rating: int = Field(ge=1, le=5)
    comment: str
    organization_rating: int = Field(ge=1, le=5, default=5)
    content_rating: int = Field(ge=1, le=5, default=5)
    is_anonymous: bool = False

class FeedbackResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    user_name: str
    rating: int
    organization_rating: int
    content_rating: int
    comment: str
    created_at: str
