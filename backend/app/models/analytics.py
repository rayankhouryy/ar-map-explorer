import enum
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Enum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class EventType(str, enum.Enum):
    MAP_VIEW = "map_view"
    PREVIEW_OPEN = "preview_open"
    AR_ENTER = "ar_enter"
    AR_EXIT = "ar_exit"
    INTERACT = "interact"
    SCREENSHOT = "screenshot"
    REPORT = "report"

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    artifact_id = Column(Integer, ForeignKey("artifacts.id"))
    
    event_type = Column(Enum(EventType), nullable=False)
    session_id = Column(String)
    
    # Event data
    dwell_time_seconds = Column(Float)  # For AR sessions
    distance_meters = Column(Float)     # User distance from artifact
    event_metadata = Column(JSON)       # Additional event-specific data
    
    # Location (optional - where user was when event occurred)
    user_latitude = Column(Float)
    user_longitude = Column(Float)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="analytics_events")
    artifact = relationship("Artifact", back_populates="analytics_events")
