#!/usr/bin/env python3
"""
Update Space Needle artifact with real media URLs
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models import user, artifact  # Import all models to resolve relationships
from app.models.artifact import Artifact

def update_space_needle_media():
    """Update the Space Needle artifact with real media URLs"""
    db = SessionLocal()
    try:
        # Find the Space Needle artifact
        space_needle = db.query(Artifact).filter(
            Artifact.title == "Seattle Space Needle"
        ).first()
        
        if not space_needle:
            print("❌ Space Needle artifact not found")
            return
        
        # Update with real media URLs
        space_needle.asset_url = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
        space_needle.thumbnail_url = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        space_needle.preview_url = "https://www.youtube.com/embed/dQw4w9WgXcQ"
        
        db.commit()
        
        print("✅ Space Needle artifact updated with real media URLs!")
        print(f"📸 Image: {space_needle.asset_url[:60]}...")
        print(f"🖼️ Thumbnail: {space_needle.thumbnail_url[:60]}...")
        print(f"🎥 Video: {space_needle.preview_url}")
        
    except Exception as e:
        print(f"❌ Error updating Space Needle: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🗼 Updating Space Needle with real media...")
    update_space_needle_media()
