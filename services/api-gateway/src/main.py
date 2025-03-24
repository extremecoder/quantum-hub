"""
Quantum Hub API Gateway
-----------------------
Main API Gateway service that routes requests to the appropriate microservices
and handles cross-cutting concerns like authentication, rate limiting, etc.
"""

import os
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRouter
import httpx
import logging
from logging.config import dictConfig
import time
from typing import Dict, List, Optional, Any

# Configure logging
logging_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",
        },
        "json": {
            "formatter": "json",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "api-gateway": {"handlers": ["json"], "level": "INFO"},
    },
}
dictConfig(logging_config)
logger = logging.getLogger("api-gateway")

# Service URLs from environment variables with defaults for local development
SERVICE_URLS = {
    "auth": os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001"),
    "discovery": os.getenv("DISCOVERY_SERVICE_URL", "http://discovery-service:8002"),
    "execution": os.getenv("EXECUTION_SERVICE_URL", "http://execution-service:8003"),
    "monitoring": os.getenv("MONITORING_SERVICE_URL", "http://monitoring-service:8004"),
    "subscription": os.getenv("SUBSCRIPTION_SERVICE_URL", "http://subscription-service:8005"),
}

# Initialize FastAPI
app = FastAPI(
    title="Quantum Hub API Gateway",
    description="Gateway API for the Quantum Hub platform",
    version="0.1.0",
)

# Configure CORS
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),  # Next.js frontend in dev
    "https://quantum-hub.example.com",                   # Production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint for the API Gateway."""
    return {"status": "healthy", "service": "api-gateway"}

# Service routers
auth_router = APIRouter(prefix="/api/auth")
discovery_router = APIRouter(prefix="/api/discovery")
execution_router = APIRouter(prefix="/api/execution")
monitoring_router = APIRouter(prefix="/api/monitoring")
subscription_router = APIRouter(prefix="/api/subscription")

# Auth Service Routes
@auth_router.get("/status")
async def auth_status():
    """Check auth service status."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICE_URLS['auth']}/status")
            return response.json()
        except httpx.RequestError as exc:
            logger.error(f"Auth service request failed: {exc}")
            raise HTTPException(status_code=503, detail="Auth service unavailable")

@auth_router.post("/login")
async def login(request: Request):
    """Forward login request to auth service."""
    body = await request.json()
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['auth']}/login", 
                json=body
            )
            return response.json()
        except httpx.RequestError as exc:
            logger.error(f"Login request failed: {exc}")
            raise HTTPException(status_code=503, detail="Auth service unavailable")

# Discovery Service Routes
@discovery_router.get("/apps")
async def list_apps(
    query: Optional[str] = None, 
    category: Optional[str] = None,
    page: int = 1, 
    limit: int = 20
):
    """List available quantum applications."""
    params = {"page": page, "limit": limit}
    if query:
        params["query"] = query
    if category:
        params["category"] = category
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['discovery']}/apps", 
                params=params
            )
            return response.json()
        except httpx.RequestError as exc:
            logger.error(f"Discovery service request failed: {exc}")
            raise HTTPException(status_code=503, detail="Discovery service unavailable")

@discovery_router.get("/apps/{app_id}")
async def get_app(app_id: str):
    """Get details for a specific quantum application."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['discovery']}/apps/{app_id}"
            )
            return response.json()
        except httpx.RequestError as exc:
            logger.error(f"Discovery service request failed: {exc}")
            raise HTTPException(status_code=503, detail="Discovery service unavailable")

# Execution Service Routes
@execution_router.post("/jobs")
async def submit_job(request: Request):
    """Submit a quantum job for execution."""
    body = await request.json()
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['execution']}/jobs", 
                json=body
            )
            return response.json()
        except httpx.RequestError as exc:
            logger.error(f"Execution service request failed: {exc}")
            raise HTTPException(status_code=503, detail="Execution service unavailable")

@execution_router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get the status of a quantum job."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['execution']}/jobs/{job_id}"
            )
            return response.json()
        except httpx.RequestError as exc:
            logger.error(f"Execution service request failed: {exc}")
            raise HTTPException(status_code=503, detail="Execution service unavailable")

# Monitoring Service Routes
@monitoring_router.get("/metrics/{app_id}")
async def get_app_metrics(app_id: str, period: str = "day"):
    """Get performance metrics for a quantum application."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['monitoring']}/metrics/{app_id}",
                params={"period": period}
            )
            return response.json()
        except httpx.RequestError as exc:
            logger.error(f"Monitoring service request failed: {exc}")
            raise HTTPException(status_code=503, detail="Monitoring service unavailable")

# Subscription Service Routes
@subscription_router.post("/subscribe/{app_id}")
async def subscribe(app_id: str, request: Request):
    """Subscribe to a quantum application."""
    body = await request.json()
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['subscription']}/subscribe/{app_id}", 
                json=body
            )
            return response.json()
        except httpx.RequestError as exc:
            logger.error(f"Subscription service request failed: {exc}")
            raise HTTPException(status_code=503, detail="Subscription service unavailable")

# Include routers
app.include_router(auth_router)
app.include_router(discovery_router)
app.include_router(execution_router)
app.include_router(monitoring_router)
app.include_router(subscription_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 