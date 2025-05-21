from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.team_member import TeamMember
from app.schemas.team_member import TeamMemberOut

router = APIRouter(prefix="/team", tags=["Team"])


def build_tree(members):
    member_map = {m.id: m for m in members}
    node_map = {}

    def to_dict(m):
        return {
            "id": m.id,
            "name": m.name,
            "position": m.position,
            "region": m.region,
            "location": m.location,
            "role_type": m.role_type,
            "role_description": m.role_description,
            "email": m.email,
            "phone": m.phone,
            "role_doc_url": m.role_doc_url,
            "reports_to_id": m.reports_to_id,
            "children": []
        }

    for m in members:
        node_map[m.id] = to_dict(m)

    roots = []
    for m in members:
        node = node_map[m.id]
        if m.reports_to_id and m.reports_to_id in node_map:
            node_map[m.reports_to_id]["children"].append(node)
        else:
            roots.append(node)

    return roots


@router.get("/tree")
def get_team_tree(db: Session = Depends(get_db)):
    members = db.query(TeamMember).all()

    def build_tree(members):
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
                "reports_to_id": m.reports_to_id,
                "children": [],
            }

        for m in members:
            node_map[m.id] = build_node(m)

        tree = []
        for node in node_map.values():
            parent_id = node["reports_to_id"]
            if parent_id and parent_id in node_map:
                node_map[parent_id]["children"].append(node)
            else:
                tree.append(node)

        return tree

    return build_tree(members)