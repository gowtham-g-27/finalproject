from enum import Enum
from typing import Optional
from pydantic import BaseModel

class RegistrationStatus(str, Enum):
    CONFIRMED = "confirmed"
    WAITLISTED = "waitlisted"
    CANCELLED = "cancelled"
    ATTENDED = "attended"

class RegistrationCreate(BaseModel):
    event_id: str

class RegistrationResponse(BaseModel):
    id: str
    event_id: str
    event_title: str
    event_date: str
    event_time: str
    event_venue: str
    user_id: str
    user_name: str
    user_email: str
    status: RegistrationStatus
    ticket_code: str # Unique QR token
    registered_at: str
    attended_at: Optional[str] = None
    certificate_id: Optional[str] = None
