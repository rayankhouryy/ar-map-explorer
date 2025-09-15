import enum
from sqlalchemy import Boolean, Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    EXPLORER = "explorer"
    CREATOR = "creator" 
    TENANT_ADMIN = "tenant_admin"

class AuthProvider(str, enum.Enum):
    EMAIL = "email"
    GOOGLE = "google"
    APPLE = "apple"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.EXPLORER)
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.EMAIL)
    external_id = Column(String)  # For OAuth providers
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    artifacts = relationship("Artifact", back_populates="creator")
    reports = relationship("Report", back_populates="reporter")
    analytics_events = relationship("AnalyticsEvent", back_populates="user")
