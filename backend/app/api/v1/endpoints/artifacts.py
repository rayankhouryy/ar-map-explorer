from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
import json

from app.core.deps import get_db, get_current_active_user, get_current_creator
from app.models.artifact import Artifact, ArtifactType, ArtifactStatus, AssetType
from app.models.user import User
from app.schemas.artifact import (
    Artifact as ArtifactSchema,
    ArtifactCreate,
    ArtifactUpdate,
    ArtifactWithDistance,
    ArtifactsNearResponse
)
from app.services.artifacts import get_artifacts_near, calculate_distance_and_status
from app.services.file_upload import handle_file_upload, validate_file

router = APIRouter()

@router.post("/", response_model=ArtifactSchema)
def create_artifact(
    *,
    db: Session = Depends(get_db),
    title: str = Form(...),
    description: str = Form(None),
    category: str = Form(None),
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_creator),
) -> Any:
    """
    Create a new artifact with file upload.
    """
    # Validate file
    validation_result = validate_file(file, AssetType.IMAGE)
    if not validation_result["valid"]:
        raise HTTPException(status_code=400, detail=validation_result["error"])
    
    # Handle file upload
    upload_result = handle_file_upload(file, AssetType.IMAGE)
    if not upload_result["success"]:
        raise HTTPException(status_code=500, detail=upload_result["error"])
    
    # Create artifact
    artifact = Artifact(
        title=title,
        description=description,
        category=category,
        creator_id=current_user.id,
        artifact_type=ArtifactType.ART,  # Default to art for now
        asset_type="image",
        latitude=latitude,
        longitude=longitude,
        asset_url=upload_result["asset_url"],
        thumbnail_url=upload_result.get("thumbnail_url"),
        min_view_distance=5.0,  # Default 5 meters
        max_view_distance=50.0,  # Default 50 meters
        anchor_mode="gps",
        scale_factor=1.0,
        status=ArtifactStatus.PUBLISHED,
        is_featured=False,
        report_count=0
    )
    
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    
    return artifact

@router.get("/near", response_model=ArtifactsNearResponse)
def get_nearby_artifacts(
    *,
    db: Session = Depends(get_db),
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"), 
    radius: int = Query(1000, description="Search radius in meters", le=5000),
    types: Optional[str] = Query(None, description="Comma-separated artifact types"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> Any:
    """
    Get artifacts near a location.
    """
    # Parse artifact types if provided
    artifact_types = None
    if types:
        try:
            artifact_types = [ArtifactType(t.strip()) for t in types.split(",")]
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid artifact type: {e}")
    
    artifacts = get_artifacts_near(
        db=db,
        latitude=lat,
        longitude=lng,
        radius_meters=radius,
        artifact_types=artifact_types,
        skip=skip,
        limit=limit
    )
    
    # Check if there are more artifacts beyond the limit
    has_more = len(artifacts) == limit
    
    return ArtifactsNearResponse(
        artifacts=artifacts,
        total_count=len(artifacts),
        has_more=has_more
    )

@router.get("/{artifact_id}", response_model=ArtifactWithDistance)
def get_artifact(
    *,
    db: Session = Depends(get_db),
    artifact_id: int,
    lat: Optional[float] = Query(None, description="User latitude for distance calculation"),
    lng: Optional[float] = Query(None, description="User longitude for distance calculation"),
) -> Any:
    """
    Get artifact by ID with optional distance calculation.
    """
    artifact = db.query(Artifact).filter(
        Artifact.id == artifact_id,
        Artifact.status == ArtifactStatus.PUBLISHED
    ).first()
    
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    
    # Calculate distance if user location provided
    distance_info = {}
    if lat is not None and lng is not None:
        distance_info = calculate_distance_and_status(artifact, lat, lng)
    
    artifact_dict = artifact.__dict__.copy()
    artifact_dict.update(distance_info)
    
    return ArtifactWithDistance(**artifact_dict)

@router.post("/", response_model=ArtifactSchema)
def create_artifact(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator),
    artifact_data: str = Form(..., description="JSON string of artifact data"),
    file: Optional[UploadFile] = File(None, description="Asset file"),
) -> Any:
    """
    Create a new artifact.
    """
    try:
        artifact_in = ArtifactCreate.parse_raw(artifact_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid artifact data: {e}")
    
    # Validate and upload file if provided
    asset_url = None
    thumbnail_url = None
    file_size_bytes = None
    
    if file:
        # Validate file
        validation_result = validate_file(file, artifact_in.asset_type)
        if not validation_result["valid"]:
            raise HTTPException(status_code=400, detail=validation_result["error"])
        
        # Upload file
        upload_result = handle_file_upload(file, artifact_in.asset_type)
        asset_url = upload_result["asset_url"]
        thumbnail_url = upload_result.get("thumbnail_url")
        file_size_bytes = upload_result["file_size_bytes"]
    
    # Create artifact
    artifact = Artifact(
        title=artifact_in.title,
        description=artifact_in.description,
        creator_id=current_user.id,
        artifact_type=artifact_in.artifact_type,
        asset_type=artifact_in.asset_type,
        category=artifact_in.category,
        tags=artifact_in.tags,
        latitude=artifact_in.location.latitude,
        longitude=artifact_in.location.longitude,
        address=artifact_in.location.address,
        min_view_distance=artifact_in.distance_settings.min_view_distance,
        max_view_distance=artifact_in.distance_settings.max_view_distance,
        anchor_mode=artifact_in.anchor_mode,
        scale_factor=artifact_in.scale_factor,
        asset_url=asset_url,
        thumbnail_url=thumbnail_url,
        file_size_bytes=file_size_bytes,
        menu_data=artifact_in.menu_data,
        availability_start=artifact_in.availability_start,
        availability_end=artifact_in.availability_end,
        status=ArtifactStatus.DRAFT
    )
    
    # Note: PostGIS location field disabled for now
    # artifact.location = text(f"POINT({artifact_in.location.longitude} {artifact_in.location.latitude})")
    
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    
    return artifact

@router.patch("/{artifact_id}", response_model=ArtifactSchema)
def update_artifact(
    *,
    db: Session = Depends(get_db),
    artifact_id: int,
    artifact_in: ArtifactUpdate,
    current_user: User = Depends(get_current_creator),
) -> Any:
    """
    Update an artifact.
    """
    artifact = db.query(Artifact).filter(Artifact.id == artifact_id).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    
    # Check ownership
    if artifact.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Update fields
    update_data = artifact_in.dict(exclude_unset=True)
    
    # Handle distance settings
    if "distance_settings" in update_data:
        distance_settings = update_data.pop("distance_settings")
        if distance_settings:
            update_data.update({
                "min_view_distance": distance_settings.min_view_distance,
                "max_view_distance": distance_settings.max_view_distance
            })
    
    for field, value in update_data.items():
        setattr(artifact, field, value)
    
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    
    return artifact

@router.post("/{artifact_id}/publish", response_model=ArtifactSchema)
def publish_artifact(
    *,
    db: Session = Depends(get_db),
    artifact_id: int,
    current_user: User = Depends(get_current_creator),
) -> Any:
    """
    Publish an artifact (make it visible to users).
    """
    artifact = db.query(Artifact).filter(Artifact.id == artifact_id).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    
    # Check ownership
    if artifact.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Validate artifact is ready for publishing
    if not artifact.asset_url:
        raise HTTPException(status_code=400, detail="Artifact must have an asset file")
    
    artifact.status = ArtifactStatus.PUBLISHED
    from sqlalchemy.sql import func
    artifact.published_at = func.now()
    
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    
    return artifact

@router.get("/", response_model=List[ArtifactSchema])
def list_my_artifacts(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Get current user's artifacts.
    """
    artifacts = db.query(Artifact).filter(
        Artifact.creator_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return artifacts
