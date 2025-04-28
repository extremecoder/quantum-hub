"""
API router package for Quantum App Service.
"""
from fastapi import APIRouter

from services.quantum_app_service.app.api.endpoints import quantum_apps

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(quantum_apps.router, prefix="/quantum-apps", tags=["quantum-apps"])
