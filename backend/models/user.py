from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class UserRole(str, Enum):
    STUDENT = "student"
    ORGANIZER = "organizer"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: str
    full_name: str
    role: UserRole = UserRole.STUDENT
    department: Optional[str] = "Computer Science"
    student_id: Optional[str] = None
    phone: Optional[str] = None
    interests: List[str] = []
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
