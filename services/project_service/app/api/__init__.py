"""
API router package for Project Service.
"""
from fastapi import APIRouter

from services.project_service.app.api.endpoints import projects

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
