from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.auth import Token, UserLogin, UserRegister, OAuthLogin
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.post("/register", response_model=UserSchema)
def register(
    *,
    db: Session = Depends(get_db),
    user_in: UserRegister,
) -> Any:
    """
    Create new user account.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists.",
        )
    
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/login/email", response_model=Token)
def login_email(
    *,
    db: Session = Depends(get_db),
    user_in: UserLogin,
) -> Any:
    """
    Login with email and password.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    
    if not user or not security.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/oauth", response_model=Token)
def oauth_login(
    *,
    db: Session = Depends(get_db),
    oauth_data: OAuthLogin,
) -> Any:
    """
    OAuth login with Google or Apple.
    TODO: Implement actual OAuth token verification with providers
    """
    # This is a placeholder - in production you would:
    # 1. Verify the token with the OAuth provider
    # 2. Get user info from the provider
    # 3. Create or update the user record
    
    raise HTTPException(
        status_code=501,
        detail="OAuth login not yet implemented"
    )

@router.get("/me", response_model=UserSchema)
def read_users_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.post("/test-token", response_model=UserSchema)
def test_token(current_user: User = Depends(get_current_user)) -> Any:
    """
    Test access token.
    """
    return current_user
