#!/usr/bin/env python3
"""
Sample Data Seeder for AR Map Explorer
Adds the Space Needle as a featured AR artifact example
"""

import sys
import os
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import User, UserRole
from app.models.artifact import Artifact, ArtifactType, ArtifactStatus, AssetType, AnchorMode
from app.core.security import get_password_hash
import uuid
from datetime import datetime

def create_sample_admin():
    """Create a sample admin user for seeding"""
    db = SessionLocal()
    try:
        # Check if sample admin already exists
        existing_user = db.query(User).filter(User.email == "demo@armapexplorer.com").first()
        if existing_user:
            print("✅ Sample admin user already exists")
            return existing_user
        
        # Create sample admin user
        sample_user = User(
            email="demo@armapexplorer.com",
            full_name="AR Explorer Demo",
            hashed_password=get_password_hash("demo123"),
            role=UserRole.TENANT_ADMIN,
            is_active=True,
            is_verified=True
        )
        
        db.add(sample_user)
        db.commit()
        db.refresh(sample_user)
        
        print("✅ Created sample admin user: demo@armapexplorer.com (password: demo123)")
        return sample_user
        
    except Exception as e:
        print(f"❌ Error creating sample user: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def create_space_needle_artifact(creator_user):
    """Create the Space Needle AR artifact"""
    db = SessionLocal()
    try:
        # Check if Space Needle artifact already exists
        existing_artifact = db.query(Artifact).filter(
            Artifact.title == "Seattle Space Needle"
        ).first()
        
        if existing_artifact:
            print("✅ Space Needle artifact already exists")
            return existing_artifact
        
        # Space Needle coordinates (Seattle, WA)
        space_needle_lat = 47.6205
        space_needle_lng = -122.3493
        
        # Create the Space Needle artifact
        space_needle = Artifact(
            title="Seattle Space Needle",
            description="""🏗️ Iconic Seattle Landmark

Built for the 1962 World's Fair, the Space Needle stands 605 feet tall and is one of Seattle's most recognizable landmarks.

🎯 AR Experience:
• View detailed 3D model
• Learn about its construction
• See historical facts
• Interactive tour features

📍 Location: Seattle Center
🏗️ Built: 1961-1962
👁️ Observation Deck: 520 feet high
🌟 Fun Fact: Designed to withstand earthquakes up to 9.0 magnitude!""",
            
            creator_id=creator_user.id,
            artifact_type=ArtifactType.ART,
            asset_type=AssetType.MODEL_3D,
            category="Landmark",
            tags=["seattle", "landmark", "architecture", "tourism", "historic"],
            
            # GPS coordinates
            latitude=space_needle_lat,
            longitude=space_needle_lng,
            address="400 Broad St, Seattle, WA 98109",
            
            # AR settings
            min_view_distance=10.0,  # 10 meters minimum
            max_view_distance=500.0,  # 500 meters maximum
            anchor_mode=AnchorMode.GPS,
            scale_factor=0.1,  # Scale down for mobile viewing
            
            # Asset URLs (we'll use placeholder URLs for now)
            asset_url="/uploads/models/space_needle.glb",
            thumbnail_url="/uploads/thumbnails/space_needle_thumb.jpg",
            preview_url="/uploads/previews/space_needle_preview.jpg",
            
            # File metadata
            file_size_bytes=2500000,  # ~2.5MB
            triangle_count=15000,
            texture_resolution=1024,
            
            # Availability (always available for demo)
            is_open_now=True,
            
            # Status
            status=ArtifactStatus.PUBLISHED,
            is_featured=True,  # Featured artifact
            report_count=0,
            
            # Timestamps
            created_at=datetime.utcnow(),
            published_at=datetime.utcnow()
        )
        
        db.add(space_needle)
        db.commit()
        db.refresh(space_needle)
        
        print("✅ Created Space Needle AR artifact")
        print(f"   📍 Location: {space_needle_lat}, {space_needle_lng}")
        print(f"   🎯 Artifact ID: {space_needle.id}")
        print(f"   📱 Viewable from 10-500 meters away")
        
        return space_needle
        
    except Exception as e:
        print(f"❌ Error creating Space Needle artifact: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def create_additional_seattle_artifacts(creator_user):
    """Create additional Seattle landmarks for a richer demo experience"""
    db = SessionLocal()
    try:
        artifacts = [
            {
                "title": "Pike Place Market",
                "description": "🐟 World-famous public market\n\nHome to the flying fish, fresh produce, and the original Starbucks!",
                "lat": 47.6085,
                "lng": -122.3401,
                "category": "Market",
                "tags": ["seattle", "market", "food", "starbucks", "tourism"],
                "type": ArtifactType.INFO_CARD
            },
            {
                "title": "Kerry Park Viewpoint", 
                "description": "📸 Best Seattle skyline views\n\nPerfect spot for capturing the Space Needle and downtown Seattle!",
                "lat": 47.6295,
                "lng": -122.3597,
                "category": "Viewpoint",
                "tags": ["seattle", "viewpoint", "photography", "skyline"],
                "type": ArtifactType.WAYFINDING
            },
            {
                "title": "Chihuly Garden and Glass",
                "description": "🎨 Stunning glass art museum\n\nFeaturing the work of renowned artist Dale Chihuly, located right next to the Space Needle!",
                "lat": 47.6205,
                "lng": -122.3506,
                "category": "Museum",
                "tags": ["seattle", "art", "museum", "glass", "chihuly"],
                "type": ArtifactType.ART
            }
        ]
        
        created_count = 0
        for artifact_data in artifacts:
            # Check if artifact already exists
            existing = db.query(Artifact).filter(
                Artifact.title == artifact_data["title"]
            ).first()
            
            if not existing:
                artifact = Artifact(
                    title=artifact_data["title"],
                    description=artifact_data["description"],
                    creator_id=creator_user.id,
                    artifact_type=artifact_data["type"],
                    asset_type=AssetType.IMAGE,
                    category=artifact_data["category"],
                    tags=artifact_data["tags"],
                    latitude=artifact_data["lat"],
                    longitude=artifact_data["lng"],
                    min_view_distance=5.0,
                    max_view_distance=100.0,
                    anchor_mode=AnchorMode.GPS,
                    scale_factor=1.0,
                    asset_url=f"/uploads/images/{artifact_data['title'].lower().replace(' ', '_')}.jpg",
                    thumbnail_url=f"/uploads/thumbnails/{artifact_data['title'].lower().replace(' ', '_')}_thumb.jpg",
                    is_open_now=True,
                    status=ArtifactStatus.PUBLISHED,
                    is_featured=False,
                    report_count=0,
                    created_at=datetime.utcnow(),
                    published_at=datetime.utcnow()
                )
                
                db.add(artifact)
                created_count += 1
        
        if created_count > 0:
            db.commit()
            print(f"✅ Created {created_count} additional Seattle landmarks")
        else:
            print("✅ Additional Seattle landmarks already exist")
            
    except Exception as e:
        print(f"❌ Error creating additional artifacts: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main seeding function"""
    print("🌍 AR Map Explorer - Sample Data Seeder")
    print("=====================================")
    
    # Create database tables if they don't exist
    print("📊 Ensuring database tables exist...")
    from app.models import base
    base.Base.metadata.create_all(bind=engine)
    
    # Create sample admin user
    print("\n👤 Creating sample admin user...")
    admin_user = create_sample_admin()
    if not admin_user:
        print("❌ Failed to create admin user. Exiting.")
        return
    
    # Create Space Needle artifact
    print("\n🗼 Creating Space Needle AR artifact...")
    space_needle = create_space_needle_artifact(admin_user)
    if not space_needle:
        print("❌ Failed to create Space Needle artifact. Exiting.")
        return
    
    # Create additional Seattle landmarks
    print("\n🏙️ Creating additional Seattle landmarks...")
    create_additional_seattle_artifacts(admin_user)
    
    print("\n🎉 Sample data seeding completed!")
    print("\n📱 Test the AR experience:")
    print("   1. Open the app and register/login")
    print("   2. Navigate to the Map tab")
    print("   3. Look for the Space Needle marker in Seattle")
    print("   4. Tap to view the 3D model AR experience")
    print("\n🌟 Featured artifacts:")
    print("   • Space Needle (3D Model) - Seattle Center")
    print("   • Pike Place Market - Historic Market")
    print("   • Kerry Park - Best Seattle Views")
    print("   • Chihuly Garden - Glass Art Museum")

if __name__ == "__main__":
    main()
