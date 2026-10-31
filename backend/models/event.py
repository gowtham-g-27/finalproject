from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class EventStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class EventCategory(str, Enum):
    TECHNICAL = "Technical"
    CULTURAL = "Cultural"
    SPORTS = "Sports"
    ACADEMIC = "Academic"
    WORKSHOP = "Workshop"
    SEMINAR = "Seminar"
    COMPETITION = "Competition"
    OTHER = "Other"

class EventBase(BaseModel):
    title: str
    description: str
    category: EventCategory = EventCategory.TECHNICAL
    tags: List[str] = []
    venue: str
    date: str  # YYYY-MM-DD
    start_time: str # HH:MM
    end_time: str # HH:MM
    registration_deadline: str # YYYY-MM-DDTHH:MM
    capacity: int = Field(ge=1, default=100)
    poster_url: Optional[str] = None
    eligibility: Optional[str] = "Open to all students"
    is_featured: bool = False

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[EventCategory] = None
    tags: Optional[List[str]] = None
    venue: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    registration_deadline: Optional[str] = None
    capacity: Optional[int] = None
    poster_url: Optional[str] = None
    eligibility: Optional[str] = None
    status: Optional[EventStatus] = None
    rejection_reason: Optional[str] = None

class EventResponse(EventBase):
    id: str
    organizer_id: str
    organizer_name: str
    status: EventStatus = EventStatus.PENDING
    rejection_reason: Optional[str] = None
    registered_count: int = 0
    waitlist_count: int = 0
    attended_count: int = 0
    created_at: str
    updated_at: Optional[str] = None

