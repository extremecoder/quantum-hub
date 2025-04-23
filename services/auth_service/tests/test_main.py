"""
Test version of the main application module.

This module provides a simplified version of the main application
specifically for testing purposes.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from services.auth_service.app.api import api_router
from services.auth_service.app.core.config import settings

# Create FastAPI app for testing
app = FastAPI(
    title=f"{settings.PROJECT_NAME} Test",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for service monitoring."""
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "service": "auth_service"}
    )
