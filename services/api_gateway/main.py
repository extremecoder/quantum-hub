from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
import httpx
import os
from dotenv import load_dotenv
from typing import Optional
import jwt
from datetime import datetime

load_dotenv()

app = FastAPI(title="Quantum Hub API Gateway")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
PROJECT_SERVICE_URL = os.getenv("PROJECT_SERVICE_URL", "http://localhost:8002")
REGISTRY_SERVICE_URL = os.getenv("REGISTRY_SERVICE_URL", "http://localhost:8003")
MARKETPLACE_SERVICE_URL = os.getenv("MARKETPLACE_SERVICE_URL", "http://localhost:8004")

# Security
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def forward_request(request: Request, service_url: str, path: str):
    client = httpx.AsyncClient()
    try:
        # Forward headers
        headers = dict(request.headers)
        headers.pop("host", None)
        
        # Forward query parameters
        query_params = dict(request.query_params)
        
        # Forward body if present
        body = await request.body() if request.method in ["POST", "PUT", "PATCH"] else None
        
        # Make request to service
        response = await client.request(
            method=request.method,
            url=f"{service_url}{path}",
            headers=headers,
            params=query_params,
            content=body,
            follow_redirects=True
        )
        
        return JSONResponse(
            content=response.json(),
            status_code=response.status_code,
            headers=dict(response.headers)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await client.aclose()

# Auth Service Routes
@app.post("/auth/register")
async def register(request: Request):
    return await forward_request(request, AUTH_SERVICE_URL, "/register")

@app.post("/auth/token")
async def login(request: Request):
    return await forward_request(request, AUTH_SERVICE_URL, "/token")

@app.get("/auth/users/me")
async def get_current_user(request: Request, username: str = Depends(verify_token)):
    return await forward_request(request, AUTH_SERVICE_URL, "/users/me")

# Project Service Routes
@app.post("/projects")
async def create_project(request: Request, username: str = Depends(verify_token)):
    return await forward_request(request, PROJECT_SERVICE_URL, "/projects")

@app.get("/projects/{project_id}")
async def get_project(request: Request, project_id: str, username: str = Depends(verify_token)):
    return await forward_request(request, PROJECT_SERVICE_URL, f"/projects/{project_id}")

@app.get("/projects/user/{user_id}")
async def get_user_projects(request: Request, user_id: str, username: str = Depends(verify_token)):
    return await forward_request(request, PROJECT_SERVICE_URL, f"/projects/user/{user_id}")

@app.put("/projects/{project_id}")
async def update_project(request: Request, project_id: str, username: str = Depends(verify_token)):
    return await forward_request(request, PROJECT_SERVICE_URL, f"/projects/{project_id}")

@app.delete("/projects/{project_id}")
async def delete_project(request: Request, project_id: str, username: str = Depends(verify_token)):
    return await forward_request(request, PROJECT_SERVICE_URL, f"/projects/{project_id}")

# Registry Service Routes
@app.post("/registry")
async def create_registry_item(request: Request, username: str = Depends(verify_token)):
    return await forward_request(request, REGISTRY_SERVICE_URL, "/registry")

@app.get("/registry/{item_id}")
async def get_registry_item(request: Request, item_id: str):
    return await forward_request(request, REGISTRY_SERVICE_URL, f"/registry/{item_id}")

@app.get("/registry")
async def list_registry_items(request: Request):
    return await forward_request(request, REGISTRY_SERVICE_URL, "/registry")

@app.put("/registry/{item_id}")
async def update_registry_item(request: Request, item_id: str, username: str = Depends(verify_token)):
    return await forward_request(request, REGISTRY_SERVICE_URL, f"/registry/{item_id}")

@app.delete("/registry/{item_id}")
async def delete_registry_item(request: Request, item_id: str, username: str = Depends(verify_token)):
    return await forward_request(request, REGISTRY_SERVICE_URL, f"/registry/{item_id}")

# Marketplace Service Routes
@app.post("/marketplace")
async def create_api_offering(request: Request, username: str = Depends(verify_token)):
    return await forward_request(request, MARKETPLACE_SERVICE_URL, "/marketplace")

@app.get("/marketplace/{offering_id}")
async def get_api_offering(request: Request, offering_id: str):
    return await forward_request(request, MARKETPLACE_SERVICE_URL, f"/marketplace/{offering_id}")

@app.get("/marketplace")
async def list_api_offerings(request: Request):
    return await forward_request(request, MARKETPLACE_SERVICE_URL, "/marketplace")

@app.post("/marketplace/{offering_id}/subscribe")
async def subscribe_to_offering(request: Request, offering_id: str, username: str = Depends(verify_token)):
    return await forward_request(request, MARKETPLACE_SERVICE_URL, f"/marketplace/{offering_id}/subscribe")

@app.get("/marketplace/subscriptions/{user_id}")
async def get_user_subscriptions(request: Request, user_id: str, username: str = Depends(verify_token)):
    return await forward_request(request, MARKETPLACE_SERVICE_URL, f"/marketplace/subscriptions/{user_id}")

@app.post("/marketplace/subscriptions/{subscription_id}/cancel")
async def cancel_subscription(request: Request, subscription_id: str, username: str = Depends(verify_token)):
    return await forward_request(request, MARKETPLACE_SERVICE_URL, f"/marketplace/subscriptions/{subscription_id}/cancel")

@app.post("/marketplace/{offering_id}/rate")
async def rate_offering(request: Request, offering_id: str, username: str = Depends(verify_token)):
    return await forward_request(request, MARKETPLACE_SERVICE_URL, f"/marketplace/{offering_id}/rate")

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"} 