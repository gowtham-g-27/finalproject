from typing import Optional, Dict, Any
from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_role: str
    action: str
    resource_type: str
    resource_id: str
    details: Optional[Dict[str, Any]] = None
    timestamp: str
