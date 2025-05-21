from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.user import create_user
from app.core.security import hash_password

def create_admin_user():
    db = next(get_db())
    admin_data = UserCreate(
        name="Admin",
        email="admin@example.com",
        password="admin123",
        is_admin=True
    )
    
    try:
        admin = create_user(db, admin_data)
        print(f"Usuario administrador creado exitosamente: {admin.email}")
    except Exception as e:
        print(f"Error al crear usuario administrador: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user() 