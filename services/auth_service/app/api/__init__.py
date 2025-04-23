"""
API router package for Auth Service.
"""
from fastapi import APIRouter

from services.auth_service.app.api.endpoints import auth, users

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
