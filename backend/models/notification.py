from typing import Optional
from pydantic import BaseModel

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str # info, success, warning, alert
    link: Optional[str] = None
    is_read: bool = False
    created_at: str

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str = "info"
    link: Optional[str] = None
