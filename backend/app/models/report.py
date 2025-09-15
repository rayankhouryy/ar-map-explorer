import enum
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ReportReason(str, enum.Enum):
    INAPPROPRIATE_CONTENT = "inappropriate_content"
    SPAM = "spam"
    WRONG_LOCATION = "wrong_location"
    COPYRIGHT = "copyright"
    HARASSMENT = "harassment"
    OTHER = "other"

class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWING = "reviewing"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    artifact_id = Column(Integer, ForeignKey("artifacts.id"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    reason = Column(Enum(ReportReason), nullable=False)
    description = Column(Text)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True))
    
    # Relationships
    artifact = relationship("Artifact", back_populates="reports")
    reporter = relationship("User", back_populates="reports")
