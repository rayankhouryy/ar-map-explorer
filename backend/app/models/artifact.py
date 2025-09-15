import enum
from sqlalchemy import (
    Boolean, Column, Integer, String, DateTime, Text, Float, 
    ForeignKey, Enum, JSON
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
# from geoalchemy2 import Geography  # Disabled for now
from app.core.database import Base

class ArtifactType(str, enum.Enum):
    ART = "art"
    MENU = "menu"
    WAYFINDING = "wayfinding"
    OBJECT_SCAN = "object_scan"
    INFO_CARD = "info_card"

class AnchorMode(str, enum.Enum):
    GPS = "gps"
    IMAGE_TARGET = "image_target"
    GEOANCHOR = "geoanchor"

class AssetType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"
    MODEL_3D = "model_3d"
    PDF = "pdf"

class ArtifactStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    REPORTED = "reported"
    HIDDEN = "hidden"

class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Classification
    artifact_type = Column(Enum(ArtifactType), nullable=False)
    asset_type = Column(Enum(AssetType), nullable=False)
    category = Column(String)  # sculpture, mural, food, etc.
    tags = Column(JSON)  # List of tags
    
    # Location and spatial data
    # location = Column(Geography(geometry_type='POINT', srid=4326), nullable=False)  # Disabled for now
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String)
    
    # Distance constraints (in meters)
    min_view_distance = Column(Integer, default=0)  # 0-200m
    max_view_distance = Column(Integer, default=100)  # 10-2000m
    
    # AR settings
    anchor_mode = Column(Enum(AnchorMode), default=AnchorMode.GPS)
    scale_factor = Column(Float, default=1.0)
    
    # Asset file paths
    asset_url = Column(String)  # Main asset (model, image, etc.)
    thumbnail_url = Column(String)
    preview_url = Column(String)
    
    # Asset metadata
    file_size_bytes = Column(Integer)
    triangle_count = Column(Integer)  # For 3D models
    texture_resolution = Column(Integer)  # Max texture size
    
    # Menu-specific data (for menu artifacts)
    menu_data = Column(JSON)  # JSON schema for menu items
    pdf_fallback_url = Column(String)
    
    # Availability
    availability_start = Column(DateTime(timezone=True))
    availability_end = Column(DateTime(timezone=True))
    is_open_now = Column(Boolean, default=True)
    
    # Status and moderation
    status = Column(Enum(ArtifactStatus), default=ArtifactStatus.DRAFT)
    is_featured = Column(Boolean, default=False)
    report_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True))
    
    # Relationships
    creator = relationship("User", back_populates="artifacts")
    reports = relationship("Report", back_populates="artifact")
    analytics_events = relationship("AnalyticsEvent", back_populates="artifact")
