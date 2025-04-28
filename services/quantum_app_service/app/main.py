"""
Main application module for the Quantum App Service.

This module sets up the FastAPI application with middleware, routes, and
database connections. It serves as the entry point for the service.
"""
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from services.quantum_app_service.app.api import api_router
from services.quantum_app_service.app.core.config import settings
from services.shared.utils.logging import configure_logging, set_request_id

# Configure logging
configure_logging(service_name="quantum_app_service")
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    # Quantum Hub Quantum App Service API

    The Quantum App Service provides APIs for managing quantum applications.

    ## Quantum App Management

    * **Apps**: Create, list, update, and delete quantum applications
    * **Versions**: Manage different versions of quantum applications
    * **Upload**: Upload quantum applications as zip packages
    * **Download**: Download quantum application packages

    ## Features

    * **App CRUD**: Full quantum application lifecycle management
    * **Version Management**: Track and manage different versions of quantum applications
    * **Package Validation**: Validate quantum application packages
    * **Manifest Parsing**: Parse quantum_manifest.json files
    """,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_tags=[
        {
            "name": "quantum-apps",
            "description": "Quantum application management operations",
        },
        {
            "name": "versions",
            "description": "Quantum application version management operations",
        },
    ],
    swagger_ui_parameters={"defaultModelsExpandDepth": -1}
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add middleware for request ID and logging
@app.middleware("http")
async def add_request_id_and_log(request: Request, call_next):
    """Add request ID to each request and log request/response."""
    # Generate request ID
    request_id = f"req-{time.time()}-{id(request)}"
    
    # Set request ID in context
    set_request_id(request_id)
    
    # Log request
    logger.info(f"Request: {request.method} {request.url.path}", extra={
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "query": str(request.query_params),
    })
    
    # Process request
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Log response
    logger.info(f"Response: {response.status_code} ({process_time:.4f}s)", extra={
        "request_id": request_id,
        "status_code": response.status_code,
        "process_time": process_time,
    })
    
    # Add request ID to response headers
    response.headers["X-Request-ID"] = request_id
    
    return response

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for service monitoring."""
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "service": "quantum_app_service"}
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup."""
    logger.info("Quantum App Service starting up")
    # In the future, this could initialize database connections, etc.

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    logger.info("Quantum App Service shutting down")
    # In the future, this could close database connections, etc.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8003, reload=True)
