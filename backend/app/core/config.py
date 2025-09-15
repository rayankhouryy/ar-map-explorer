from typing import List, Union
from pydantic import AnyHttpUrl, EmailStr, validator
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://rayankhoury@localhost:5432/ar_map_explorer")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:19006",  # Expo default
        "http://10.0.0.252:19006", # Expo on local network
        "*",  # Allow all origins for development
    ]
    
    # File Upload Settings
    MAX_IMAGE_SIZE_MB: int = 10
    MAX_FILE_SIZE_MB: int = 50
    MAX_MODEL_SIZE_MB: int = 100
    MAX_TEXTURE_SIZE: int = 4096

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # File upload limits
    MAX_FILE_SIZE_MB: int = 50
    MAX_IMAGE_SIZE_MB: int = 10
    MAX_MODEL_SIZE_MB: int = 25
    MAX_TRIANGLES: int = 150000
    MAX_TEXTURE_SIZE: int = 4096
    
    # Distance constraints
    MIN_VIEW_DISTANCE_M: int = 0
    MAX_VIEW_DISTANCE_M: int = 2000
    
    # AWS S3 (optional for production file storage)
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "")
    
    class Config:
        case_sensitive = True

settings = Settings()
