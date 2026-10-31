from typing import Optional
from pydantic import BaseModel

class CheckInRequest(BaseModel):
    ticket_code: str
    event_id: str

class CheckInResponse(BaseModel):
    success: bool
    message: str
    student_name: str
    student_email: str
    event_title: str
    ticket_code: str
    attended_at: str
    already_checked_in: bool = False

