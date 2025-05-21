from pydantic import BaseModel, EmailStr
from typing import Optional


class TeamMemberBase(BaseModel):
    name: str
    position: str
    area: str
    region: str
    location: Optional[str] = None
    role_type: Optional[str] = None
    role_description: str
    email: EmailStr
    phone: str
    reports_to_id: Optional[int] = None
    role_doc_url: Optional[str] = None


class TeamMemberCreate(TeamMemberBase):
    pass


class TeamMemberRead(TeamMemberBase):
    id: int

    class Config:
        from_attributes = True


class TeamMemberOut(TeamMemberRead):
    pass