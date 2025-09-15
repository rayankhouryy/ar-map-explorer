from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from app.models.artifact import ArtifactType, AnchorMode, AssetType, ArtifactStatus

class ArtifactBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    artifact_type: ArtifactType
    asset_type: AssetType
    category: Optional[str] = None
    tags: Optional[List[str]] = []

class ArtifactLocation(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    address: Optional[str] = None

class ArtifactDistanceSettings(BaseModel):
    min_view_distance: int = Field(0, ge=0, le=200)
    max_view_distance: int = Field(100, ge=10, le=2000)
    
    @validator('max_view_distance')
    def max_must_be_greater_than_min(cls, v, values):
        if 'min_view_distance' in values and v <= values['min_view_distance']:
            raise ValueError('max_view_distance must be greater than min_view_distance')
        return v

class ArtifactCreate(ArtifactBase):
    location: ArtifactLocation
    distance_settings: ArtifactDistanceSettings
    anchor_mode: AnchorMode = AnchorMode.GPS
    scale_factor: float = Field(1.0, gt=0, le=10)
    menu_data: Optional[Dict[str, Any]] = None
    availability_start: Optional[datetime] = None
    availability_end: Optional[datetime] = None

class ArtifactUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    distance_settings: Optional[ArtifactDistanceSettings] = None
    anchor_mode: Optional[AnchorMode] = None
    scale_factor: Optional[float] = Field(None, gt=0, le=10)
    menu_data: Optional[Dict[str, Any]] = None
    availability_start: Optional[datetime] = None
    availability_end: Optional[datetime] = None
    status: Optional[ArtifactStatus] = None

class ArtifactInDBBase(ArtifactBase):
    id: int
    creator_id: int
    latitude: float
    longitude: float
    address: Optional[str] = None
    min_view_distance: int
    max_view_distance: int
    anchor_mode: AnchorMode
    scale_factor: float
    asset_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    preview_url: Optional[str] = None
    file_size_bytes: Optional[int] = None
    triangle_count: Optional[int] = None
    texture_resolution: Optional[int] = None
    menu_data: Optional[Dict[str, Any]] = None
    pdf_fallback_url: Optional[str] = None
    availability_start: Optional[datetime] = None
    availability_end: Optional[datetime] = None
    is_open_now: bool
    status: ArtifactStatus
    is_featured: bool
    report_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Artifact(ArtifactInDBBase):
    pass

class ArtifactWithDistance(Artifact):
    distance_meters: Optional[float] = None
    is_in_range: bool = False
    is_locked: bool = False

class ArtifactSummary(BaseModel):
    id: int
    title: str
    artifact_type: ArtifactType
    thumbnail_url: Optional[str] = None
    latitude: float
    longitude: float
    distance_meters: Optional[float] = None
    is_in_range: bool = False
    is_locked: bool = False

class ArtifactsNearResponse(BaseModel):
    artifacts: List[ArtifactWithDistance]
    total_count: int
    has_more: bool
