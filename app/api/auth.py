from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.db.dependency import get_db
from app.models.user import User
from app.core.security import (
    verify_password, 
    create_access_token, 
    create_refresh_token,
    get_current_user,
    validate_password_strength,
    hash_password,
    decode_token
)
from app.schemas.user import UserRegister, UserRead
from app.services.user import create_user_with_password
from app.core.security import require_role
from datetime import datetime, timedelta
from typing import Dict

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    # Check for rate limiting
    client_ip = request.client.host
    
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create both access and refresh tokens
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh")
async def refresh_token(
    request: Request,
    db: Session = Depends(get_db)
):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    refresh_token = auth_header.split(" ")[1]
    payload = decode_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create new access token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me")
async def read_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }

@router.post("/register", response_model=UserRead)
async def register_user(
    user: UserRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    # Validate password strength
    is_valid, error_message = validate_password_strength(user.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)
    
    return create_user_with_password(db, user)

@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Validate new password strength
    is_valid, error_message = validate_password_strength(new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)
    
    # Update password
    current_user.hashed_password = hash_password(new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}