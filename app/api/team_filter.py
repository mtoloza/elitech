from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.team_member import TeamMember

router = APIRouter(prefix="/team/tree", tags=["Team Filters"])

@router.get("/filters")
def get_team_filters(db: Session = Depends(get_db)):
    regions = db.query(TeamMember.region).distinct().all()
    role_types = db.query(TeamMember.role_type).distinct().all()
    return {
        "regions": [r[0] for r in regions if r[0]],
        "role_types": [r[0] for r in role_types if r[0]],
    }