# Documentación Técnica - Proyecto Elitech

## 1. Descripción General
Este proyecto es una aplicación web full-stack que utiliza FastAPI para el backend y React para el frontend. El sistema está diseñado para manejar operaciones de negocio con una arquitectura moderna y escalable.

## 2. Estructura del Proyecto

### 2.1 Backend (Python/FastAPI)
```
elitech-backend/
├── app/
│   ├── api/            # Endpoints de la API
│   ├── core/           # Configuraciones centrales
│   ├── db/             # Configuración de base de datos
│   ├── models/         # Modelos de SQLAlchemy
│   ├── schemas/        # Esquemas Pydantic
│   ├── services/       # Lógica de negocio
│   ├── uploads/        # Directorio para archivos subidos
│   └── main.py         # Punto de entrada de la aplicación
├── venv/               # Entorno virtual de Python
└── requirements.txt    # Dependencias de Python
```

### 2.2 Frontend (React)
```
elitech-frontend/
└── [Estructura del frontend]
```

## 3. Tecnologías Principales

### 3.1 Backend
- **FastAPI**: Framework web de alto rendimiento
- **SQLAlchemy**: ORM para la base de datos
- **PostgreSQL**: Base de datos principal
- **Python-dotenv**: Manejo de variables de entorno
- **Uvicorn**: Servidor ASGI

### 3.2 Frontend
- **React**: Framework de UI
- **Node.js**: Entorno de ejecución JavaScript

## 4. Configuración del Entorno

### 4.1 Requisitos del Sistema
- Python 3.x
- Node.js
- PostgreSQL
- pip (gestor de paquetes de Python)
- npm (gestor de paquetes de Node.js)

### 4.2 Dependencias Principales
```python
# requirements.txt
fastapi
uvicorn[standard]
python-dotenv
sqlalchemy
psycopg2-binary
```

## 5. Estructura de la Base de Datos
El sistema utiliza PostgreSQL como base de datos principal, con modelos definidos en SQLAlchemy para:
- Gestión de usuarios
- Gestión de productos
- Gestión de ventas
- Gestión de inventario

## 6. API Endpoints
La API REST está organizada en módulos dentro del directorio `app/api/`, siguiendo las mejores prácticas de RESTful API design.

## 7. Seguridad
- Autenticación basada en JWT
- Manejo seguro de contraseñas
- Validación de datos con Pydantic
- Protección contra CSRF
- Manejo seguro de archivos

## 8. Manejo de Archivos
El sistema incluye un directorio `uploads/` para el manejo de archivos subidos, con validaciones de seguridad y tipos de archivo permitidos.

## 9. Scripts de Utilidad
- `create_admin.py`: Script para crear usuarios administradores
- `check_uploads_dir.py`: Utilidad para verificar el directorio de uploads

## 10. Próximos Pasos
- Implementación de pruebas automatizadas
- Documentación de API con Swagger/OpenAPI
- Mejoras en la seguridad
- Optimización de rendimiento
- Implementación de CI/CD 