from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text, func
# from geoalchemy2 import Geography  # Disabled for now
from geopy.distance import geodesic

from app.models.artifact import Artifact, ArtifactStatus, ArtifactType
from app.schemas.artifact import ArtifactWithDistance

def calculate_distance_and_status(
    artifact: Artifact, 
    user_lat: float, 
    user_lng: float
) -> dict:
    """Calculate distance and determine if artifact is in range/locked."""
    # Calculate distance using geopy for accuracy
    distance_meters = geodesic(
        (user_lat, user_lng),
        (artifact.latitude, artifact.longitude)
    ).meters
    
    # Determine status based on distance constraints
    is_in_range = distance_meters <= artifact.max_view_distance
    is_locked = distance_meters < artifact.min_view_distance
    
    return {
        "distance_meters": distance_meters,
        "is_in_range": is_in_range,
        "is_locked": is_locked
    }

def get_artifacts_near(
    db: Session,
    latitude: float,
    longitude: float,
    radius_meters: int = 1000,
    artifact_types: Optional[List[ArtifactType]] = None,
    skip: int = 0,
    limit: int = 50
) -> List[ArtifactWithDistance]:
    """
    Get artifacts near a location with distance calculations.
    """
    # Base query for published artifacts
    query = db.query(Artifact).filter(
        Artifact.status == ArtifactStatus.PUBLISHED
    )
    
    # Filter by artifact types if specified
    if artifact_types:
        query = query.filter(Artifact.artifact_type.in_(artifact_types))
    
    # Simple radius filtering using lat/lng (less efficient but works without PostGIS)
    # This is a rough approximation - 1 degree ≈ 111km
    lat_range = radius_meters / 111000  # Convert to degrees
    lng_range = radius_meters / (111000 * abs(latitude))  # Adjust for longitude
    
    query = query.filter(
        Artifact.latitude.between(latitude - lat_range, latitude + lat_range),
        Artifact.longitude.between(longitude - lng_range, longitude + lng_range)
    )
    
    artifacts = query.offset(skip).limit(limit).all()
    
    # Calculate distance and status for each artifact
    artifacts_with_distance = []
    for artifact in artifacts:
        distance_info = calculate_distance_and_status(artifact, latitude, longitude)
        
        artifact_dict = artifact.__dict__.copy()
        artifact_dict.update(distance_info)
        
        artifacts_with_distance.append(ArtifactWithDistance(**artifact_dict))
    
    return artifacts_with_distance

def get_clustered_artifacts(
    db: Session,
    latitude: float,
    longitude: float,
    zoom_level: int,
    radius_meters: int = 5000
) -> List[dict]:
    """
    Get clustered artifacts for map display based on zoom level.
    Higher zoom = more detailed clustering.
    """
    # Cluster size based on zoom level
    cluster_radius = max(50, 500 - (zoom_level * 30))
    
    # This is a simplified clustering - in production you might use
    # PostGIS clustering functions or a proper clustering algorithm
    
    # Get artifacts in area using simple lat/lng filtering
    lat_range = radius_meters / 111000
    lng_range = radius_meters / (111000 * abs(latitude))
    
    artifacts = db.query(Artifact).filter(
        Artifact.status == ArtifactStatus.PUBLISHED,
        Artifact.latitude.between(latitude - lat_range, latitude + lat_range),
        Artifact.longitude.between(longitude - lng_range, longitude + lng_range)
    ).all()
    
    # Simple grid-based clustering
    clusters = {}
    for artifact in artifacts:
        # Create grid cell ID based on coordinates and cluster radius
        grid_lat = int(artifact.latitude * 10000 / cluster_radius) * cluster_radius / 10000
        grid_lng = int(artifact.longitude * 10000 / cluster_radius) * cluster_radius / 10000
        grid_key = f"{grid_lat},{grid_lng}"
        
        if grid_key not in clusters:
            clusters[grid_key] = {
                "latitude": grid_lat,
                "longitude": grid_lng,
                "count": 0,
                "artifacts": []
            }
        
        clusters[grid_key]["count"] += 1
        clusters[grid_key]["artifacts"].append(artifact.id)
    
    return list(clusters.values())
