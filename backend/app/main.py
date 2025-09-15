from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine
from app.models import base
from app.api.v1.api import api_router

# Create database tables
base.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AR Map Explorer API",
    description="API for AR Map Explorer - discover and create location-based AR experiences",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
uploads_dir = "uploads"
os.makedirs(uploads_dir, exist_ok=True)

# Mount static files for uploaded content
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "AR Map Explorer API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
