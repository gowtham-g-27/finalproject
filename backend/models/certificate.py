from pydantic import BaseModel

class CertificateResponse(BaseModel):
    id: str
    certificate_number: str
    event_id: str
    event_title: str
    user_id: str
    user_name: str
    issue_date: str
    verified: bool = True
