# src/routers/team.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.dependency import get_db
from app.models.team_member import TeamMember
from app.schemas.team_member import TeamMemberCreate, TeamMemberRead, TeamMemberOut

router = APIRouter(prefix="/team", tags=["team"])

@router.post("/", response_model=TeamMemberRead)
def create_team_member(member: TeamMemberCreate, db: Session = Depends(get_db)):
    db_member = TeamMember(**member.dict())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/", response_model=List[TeamMemberRead])
def list_team(
    db: Session = Depends(get_db),
    region: Optional[str] = Query(None),
    role_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = db.query(TeamMember)
    if region:
        query = query.filter(TeamMember.region == region)
    if role_type:
        query = query.filter(TeamMember.role_type == role_type)
    if search:
        like = f"%{search}%"
        query = query.filter(
            TeamMember.name.ilike(like) |
            TeamMember.position.ilike(like) |
            TeamMember.email.ilike(like)
        )
    return query.all()

@router.post("/{member_id}/upload-doc")
def upload_role_document(
    member_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")

    save_path = f"app/uploads/roles/member_{member_id}.pdf"
    with open(save_path, "wb") as f:
        f.write(file.file.read())

    member.role_doc_url = f"/uploads/roles/member_{member_id}.pdf"
    db.commit()
    return {"message": "Documento cargado correctamente", "url": member.role_doc_url}

@router.get("/tree")
def get_team_tree(
    region: Optional[str] = Query(None),
    role_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(TeamMember)
    if region:
        query = query.filter(TeamMember.region == region)
    if role_type:
        query = query.filter(TeamMember.role_type == role_type)

    members = query.all()
    member_dict = {m.id: m for m in members}
    node_map = {}

    def build_node(m):
        return {
            "id": m.id,
            "name": m.name,
            "position": m.position,
            "region": m.region,
            "location": m.location,
            "role_type": m.role_type,
            "children": []
        }

    for m in members:
        node_map[m.id] = build_node(m)

    tree = []
    for m in members:
        parent_id = m.reports_to_id
        if parent_id and parent_id in node_map:
            node_map[parent_id]["children"].append(node_map[m.id])
        else:
            tree.append(node_map[m.id])

    return tree

@router.delete("/{member_id}")
def delete_team_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")

    db.delete(member)
    db.commit()
    return {"ok": True}

@router.put("/{member_id}", response_model=TeamMemberRead)
def update_team_member(member_id: int, member: TeamMemberCreate, db: Session = Depends(get_db)):
    db_member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    for key, value in member.dict().items():
        setattr(db_member, key, value)
    
    db.commit()
    db.refresh(db_member)
    return db_member