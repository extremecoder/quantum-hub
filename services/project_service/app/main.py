"""
Main application module for the Project Service.

This module sets up the FastAPI application with middleware, routes, and
database connections. It serves as the entry point for the service.
"""
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from services.project_service.app.api import api_router
from services.project_service.app.core.config import settings
from services.shared.utils.logging import configure_logging, set_request_id

# Configure logging
configure_logging(service_name="project_service")
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    # Quantum Hub Project Service API

    The Project Service provides APIs for managing quantum development projects.

    ## Project Management

    * **Projects**: Create, list, update, and delete projects
    * **Project Details**: Get detailed information about a project
    * **Project Release**: Release a project as a quantum application

    ## Features

    * **Project CRUD**: Full project lifecycle management
    * **Quantum App Integration**: Release projects as quantum applications
    * **User-specific Projects**: Each user has their own set of projects
    """,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_tags=[
        {
            "name": "projects",
            "description": "Project management operations including creation, retrieval, update, and deletion",
        },
    ],
    swagger_ui_parameters={"defaultModelsExpandDepth": -1}
)

# Set up CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add request ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Add a unique request ID to each request for tracing."""
    # Get request ID from header or generate new one
    request_id = request.headers.get("X-Request-ID")
    request_id = set_request_id(request_id)

    # Add request ID to response headers
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(process_time)

    return response

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for service monitoring."""
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "service": "project_service"}
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup."""
    logger.info("Project Service starting up")
    # In the future, this could initialize database connections, etc.

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    logger.info("Project Service shutting down")
    # In the future, this could close database connections, etc.
