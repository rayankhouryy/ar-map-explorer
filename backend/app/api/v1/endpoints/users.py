from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user, get_current_admin
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Retrieve users. Admin only.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserSchema)
def read_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    
    # Users can only see their own profile unless they're admin
    if user != current_user and current_user.role.value != "tenant_admin":
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    return user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/upgrade-to-creator", response_model=UserSchema)
def upgrade_to_creator(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Upgrade current user to creator role.
    """
    if current_user.role == UserRole.CREATOR:
        raise HTTPException(
            status_code=400,
            detail="User is already a creator"
        )
    
    if current_user.role == UserRole.TENANT_ADMIN:
        raise HTTPException(
            status_code=400,
            detail="User is already a tenant admin"
        )
    
    # Upgrade to creator
    current_user.role = UserRole.CREATOR
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
