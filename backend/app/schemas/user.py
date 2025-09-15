from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import UserRole, AuthProvider

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.EXPLORER

class UserCreate(UserBase):
    password: str
    auth_provider: AuthProvider = AuthProvider.EMAIL
    external_id: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None

class UserInDBBase(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    auth_provider: AuthProvider
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
