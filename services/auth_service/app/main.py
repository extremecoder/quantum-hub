"""
Main application module for the Auth Service.

This module sets up the FastAPI application with middleware, routes, and
database connections. It serves as the entry point for the service.
"""
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from services.auth_service.app.api import api_router
from services.auth_service.app.core.config import settings
from services.shared.utils.logging import configure_logging, set_request_id

# Configure logging
configure_logging(service_name="auth_service")
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    # Quantum Hub Auth Service API

    The Auth Service provides APIs for user authentication and API key management.

    ## Authentication

    * **Register**: Create a new user account
    * **Login**: Authenticate and get access token
    * **Refresh**: Refresh an existing token
    * **Logout**: Invalidate current token
    * **Reset Password**: Request and complete password reset
    * **Email Verification**: Verify email address
    * **OAuth**: Social authentication with Google

    ## User Management

    * **Profile**: Get and update user profile

    ## API Key Management

    * **API Keys**: Create, list, update, and delete API keys
    * **Usage Statistics**: Get API usage statistics
    """,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_tags=[
        {
            "name": "authentication",
            "description": "Authentication operations including registration, login, and token management",
        },
        {
            "name": "users",
            "description": "User profile management operations",
        },
        {
            "name": "api-keys",
            "description": "API key management operations",
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

# Health check endpoints - available at both root and API prefix
@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    """Health check endpoint for service monitoring."""
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "service": "auth_service"}
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup."""
    logger.info("Auth Service starting up")
    # In the future, this could initialize database connections, etc.

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    logger.info("Auth Service shutting down")
    # In the future, this could close database connections, etc.
