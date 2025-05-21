from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from sqlalchemy import text

router = APIRouter(
    prefix="/team",
    tags=["team"]
)

# Lista blanca de vistas permitidas
ALLOWED_VIEWS = {
    "global": "vw_org_global",
    "holding": "vw_org_holding",
    "colombia": "vw_org_colombia",
    "ecuador": "vw_org_ecuador",
    "northamerica": "vw_org_northamerica",
    "kenya": "vw_org_kenya"
}

@router.get("/org/{view_name}")
def get_org_view(view_name: str, db: Session = Depends(get_db)):
    view = ALLOWED_VIEWS.get(view_name.lower())
    if not view:
        raise HTTPException(status_code=404, detail="Vista no permitida")
    try:
        result = db.execute(text(f"SELECT * FROM {view}")).fetchall()
        data = [dict(row._mapping) for row in result]

        # Construir el árbol jerárquico
        id_map = {item["id"]: {**item, "children": []} for item in data}
        root_nodes = []

        for item in id_map.values():
            parent_id = item.get("reports_to_id")
            if parent_id and parent_id in id_map:
                id_map[parent_id]["children"].append(item)
            else:
                root_nodes.append(item)

        return root_nodes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 