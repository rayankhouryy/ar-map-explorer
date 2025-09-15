import os
import uuid
from typing import Dict, Any
from fastapi import UploadFile, HTTPException
from app.core.config import settings
from app.models.artifact import AssetType

# Optional imports for advanced features
try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

try:
    import trimesh
    HAS_TRIMESH = True
except ImportError:
    HAS_TRIMESH = False

# Optional magic import - fallback if not available
try:
    import magic
    HAS_MAGIC = True
except ImportError:
    HAS_MAGIC = False
    print("Warning: python-magic not available, using filename-based type detection")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo"}
ALLOWED_MODEL_TYPES = {"model/gltf+json", "model/gltf-binary", "application/octet-stream"}
ALLOWED_PDF_TYPES = {"application/pdf"}

def get_file_type(file: UploadFile) -> str:
    """Get the actual MIME type of the uploaded file."""
    if HAS_MAGIC:
        # Read first 2048 bytes for magic number detection
        file.file.seek(0)
        header = file.file.read(2048)
        file.file.seek(0)
        return magic.from_buffer(header, mime=True)
    else:
        # Fallback to filename-based detection
        if not file.filename:
            return "application/octet-stream"
        
        ext = file.filename.lower().split('.')[-1]
        mime_map = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'png': 'image/png', 'webp': 'image/webp',
            'mp4': 'video/mp4', 'mov': 'video/quicktime',
            'avi': 'video/x-msvideo',
            'gltf': 'model/gltf+json', 'glb': 'model/gltf-binary',
            'pdf': 'application/pdf'
        }
        return mime_map.get(ext, "application/octet-stream")

def validate_file(file: UploadFile, asset_type: AssetType) -> Dict[str, Any]:
    """Validate uploaded file based on asset type and constraints."""
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    max_size = 0
    if asset_type == AssetType.IMAGE:
        max_size = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
        allowed_types = ALLOWED_IMAGE_TYPES
    elif asset_type == AssetType.VIDEO:
        max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        allowed_types = ALLOWED_VIDEO_TYPES
    elif asset_type == AssetType.MODEL_3D:
        max_size = settings.MAX_MODEL_SIZE_MB * 1024 * 1024
        allowed_types = ALLOWED_MODEL_TYPES
    elif asset_type == AssetType.PDF:
        max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        allowed_types = ALLOWED_PDF_TYPES
    else:
        return {"valid": False, "error": "Unsupported asset type"}
    
    if file_size > max_size:
        return {
            "valid": False, 
            "error": f"File too large. Maximum size is {max_size // (1024*1024)}MB"
        }
    
    # Check MIME type
    detected_type = get_file_type(file)
    
    # Special handling for GLTF files (often detected as application/octet-stream)
    if asset_type == AssetType.MODEL_3D:
        if file.filename and (file.filename.endswith('.gltf') or file.filename.endswith('.glb')):
            # Accept GLTF files even if detected as octet-stream
            pass
        elif detected_type not in allowed_types:
            return {"valid": False, "error": f"Invalid file type. Expected: {allowed_types}"}
    else:
        if detected_type not in allowed_types:
            return {"valid": False, "error": f"Invalid file type. Expected: {allowed_types}"}
    
    # Additional validation for specific types
    if asset_type == AssetType.IMAGE and HAS_PIL:
        try:
            file.file.seek(0)
            with Image.open(file.file) as img:
                width, height = img.size
                if max(width, height) > settings.MAX_TEXTURE_SIZE:
                    return {
                        "valid": False,
                        "error": f"Image too large. Maximum dimension is {settings.MAX_TEXTURE_SIZE}px"
                    }
            file.file.seek(0)
        except Exception as e:
            return {"valid": False, "error": f"Invalid image file: {str(e)}"}
    
    elif asset_type == AssetType.MODEL_3D:
        # Validate 3D model (simplified - in production you'd want more thorough validation)
        try:
            file.file.seek(0)
            file_content = file.file.read()
            file.file.seek(0)
            
            # This is a basic check - in production you'd want to:
            # 1. Actually load and validate the GLTF/GLB
            # 2. Check triangle count
            # 3. Validate textures
            # 4. Check for malicious content
            
            if len(file_content) == 0:
                return {"valid": False, "error": "Empty model file"}
                
        except Exception as e:
            return {"valid": False, "error": f"Invalid 3D model: {str(e)}"}
    
    return {"valid": True}

def generate_thumbnail(file_path: str, asset_type: AssetType) -> str:
    """Generate thumbnail for the uploaded asset."""
    thumbnail_dir = "uploads/thumbnails"
    os.makedirs(thumbnail_dir, exist_ok=True)
    
    file_id = str(uuid.uuid4())
    thumbnail_path = f"{thumbnail_dir}/{file_id}_thumb.jpg"
    
    try:
        if asset_type == AssetType.IMAGE and HAS_PIL:
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Create thumbnail
                img.thumbnail((400, 400), Image.Resampling.LANCZOS)
                img.save(thumbnail_path, 'JPEG', quality=85)
                
        elif asset_type == AssetType.MODEL_3D:
            # For 3D models, you'd typically render a preview
            # This is a placeholder - implement actual 3D thumbnail generation
            # using a headless renderer like Blender or three.js
            
            # Create a placeholder thumbnail
            if HAS_PIL:
                placeholder = Image.new('RGB', (400, 400), color='lightgray')
                placeholder.save(thumbnail_path, 'JPEG')
            
        elif asset_type == AssetType.PDF:
            # For PDFs, render first page as thumbnail
            # This requires additional libraries like pdf2image
            # Placeholder for now
            if HAS_PIL:
                placeholder = Image.new('RGB', (400, 400), color='white')
                placeholder.save(thumbnail_path, 'JPEG')
            
        return f"/uploads/thumbnails/{file_id}_thumb.jpg"
        
    except Exception as e:
        print(f"Failed to generate thumbnail: {e}")
        return None

def handle_file_upload(file: UploadFile, asset_type: AssetType) -> Dict[str, Any]:
    """Handle file upload and return file URLs."""
    
    # Create uploads directory structure
    upload_dir = f"uploads/{asset_type.value}"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_extension}"
    file_path = f"{upload_dir}/{filename}"
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
            
        file_size_bytes = len(content)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Generate thumbnail
    thumbnail_url = generate_thumbnail(file_path, asset_type)
    
    # Return file information
    return {
        "asset_url": f"/uploads/{asset_type.value}/{filename}",
        "thumbnail_url": thumbnail_url,
        "file_size_bytes": file_size_bytes,
        "original_filename": file.filename
    }
