from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.EXPLORER

class OAuthLogin(BaseModel):
    provider: str  # "google" or "apple"
    token: str     # OAuth token from provider
    
class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
