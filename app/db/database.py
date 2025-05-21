from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()  # Carga las variables del .env

DATABASE_URL = os.getenv("DATABASE_URL")

# Configuración del engine con parámetros optimizados para AWS RDS
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verifica la conexión antes de usarla
    pool_recycle=3600,   # Recicla conexiones después de 1 hora
    pool_size=5,         # Número de conexiones en el pool
    max_overflow=10,     # Máximo de conexiones adicionales
    pool_timeout=30,     # Timeout para obtener una conexión del pool
    connect_args={
        "connect_timeout": 30,  # Timeout de conexión en segundos
        "keepalives": 1,        # Mantiene la conexión viva
        "keepalives_idle": 30,  # Tiempo de inactividad antes de enviar keepalive
        "keepalives_interval": 10,  # Intervalo entre keepalives
        "keepalives_count": 5,  # Número de keepalives antes de cerrar
        "sslmode": "require"    # Requiere SSL pero sin verificación de certificado
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
