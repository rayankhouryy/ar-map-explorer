from fastapi import APIRouter
from app.api.v1.endpoints import auth, artifacts, reports, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(artifacts.router, prefix="/artifacts", tags=["artifacts"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
