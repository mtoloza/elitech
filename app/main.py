from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.models.team_member import TeamMember
from app.api import team, team_filter, user, auth, org_holding

app = FastAPI(title="EliTech Backend")

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://elitech.app",
        "https://www.elitech.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Authorization"],
)

# Routers
app.include_router(user.router)
app.include_router(auth.router)
app.include_router(team.router)
app.include_router(team_filter.router)
app.include_router(org_holding.router)

# Crear tablas en base de datos
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "EliTech Backend IT Organization active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, proxy_headers=True)