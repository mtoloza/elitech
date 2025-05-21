from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class OrgHolding(Base):
    __tablename__ = "vw_org_holding"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    position = Column(String(255))
    region = Column(String(255))
    location = Column(String(255))
    role_type = Column(String(255))
    reports_to_id = Column(Integer, ForeignKey("vw_org_holding.id"))

    supervisor = relationship("OrgHolding", remote_side=[id], backref="subordinates")
