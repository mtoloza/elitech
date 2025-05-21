from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    position = Column(String)
    area = Column(String)
    region = Column(String)
    location = Column(String)  # nueva columna
    role_type = Column(String) # nueva columna
    role_description = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    reports_to_id = Column(Integer, ForeignKey("team_members.id"), nullable=True)
    role_doc_url = Column(String, nullable=True)

    reports_to = relationship("TeamMember", remote_side=[id])
