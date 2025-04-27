"""
Simple script to verify the API documentation.

This script creates a simple FastAPI app with the same documentation
as the Auth Service and Project Service, but without the actual implementation.
"""
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from uuid import UUID
import uuid

# Create FastAPI app for Auth Service
auth_app = FastAPI(
    title="Quantum Hub Auth Service",
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
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
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

# Create FastAPI app for Project Service
project_app = FastAPI(
    title="Quantum Hub Project Service",
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
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_tags=[
        {
            "name": "projects",
            "description": "Project management operations including creation, retrieval, update, and deletion",
        },
    ],
    swagger_ui_parameters={"defaultModelsExpandDepth": -1}
)

# Add CORS middleware with more permissive settings
auth_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

project_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Define models for Auth Service
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_provider: bool = False

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID
    created_at: str
    updated_at: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class ApiKeyBase(BaseModel):
    name: str

class ApiKeyCreate(ApiKeyBase):
    expires_at: Optional[str] = None

class ApiKey(ApiKeyBase):
    id: UUID
    key: str
    created_at: str
    expires_at: Optional[str] = None
    is_active: bool = True

# Define models for Project Service
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    repo: Optional[str] = None

class Project(ProjectBase):
    id: UUID
    repo: Optional[str] = None
    created_at: str
    updated_at: str

class ProjectRelease(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    version_number: str
    sdk_used: str
    visibility: str = "PRIVATE"

class QuantumApp(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    type: str
    status: List[str]
    visibility: str
    created_at: str
    updated_at: str

# Create an in-memory storage for users
registered_users = {}

# Helper function for responses
def create_response(data: Any = None, message: str = "Success") -> Dict[str, Any]:
    return {
        "message": message,
        "data": data
    }

# Auth Service endpoints
@auth_app.post("/api/v1/auth/register", tags=["authentication"], status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate) -> Dict[str, Any]:
    """Register a new user."""
    print(f"Received registration request for user: {user_data.username}")

    # Check if username already exists
    if user_data.username in registered_users:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Username already exists", "data": None}
        )

    # Create new user
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        is_active=user_data.is_active,
        is_provider=user_data.is_provider,
        created_at="2023-06-01T12:00:00Z",
        updated_at="2023-06-01T12:00:00Z"
    )

    # Store user in memory with hashed password (in a real app, you'd hash the password)
    registered_users[user_data.username] = {
        "user": user,
        "password": user_data.password  # In a real app, this would be hashed
    }

    print(f"Registered users: {list(registered_users.keys())}")

    # Create token
    token = Token(
        access_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        token_type="bearer",
        user=user
    )

    # Return a proper response that will work with Swagger UI
    return {
        "message": "User registered successfully",
        "data": {
            "access_token": token.access_token,
            "token_type": token.token_type,
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_provider": user.is_provider,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
        }
    }

@auth_app.post("/api/v1/auth/login", tags=["authentication"])
async def login(username: str = Body(...), password: str = Body(...)) -> Dict[str, Any]:
    """Login a user."""
    print(f"Received login request for user: {username}")

    # Check if user exists
    if username not in registered_users:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"message": "Invalid username or password", "data": None}
        )

    # Check password (in a real app, you'd verify the hashed password)
    user_data = registered_users[username]
    if user_data["password"] != password:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"message": "Invalid username or password", "data": None}
        )

    # Get user from storage
    user = user_data["user"]

    # Create token
    token = Token(
        access_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        token_type="bearer",
        user=user
    )

    # Return a proper response that will work with Swagger UI
    return {
        "message": "Login successful",
        "data": {
            "access_token": token.access_token,
            "token_type": token.token_type,
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_provider": user.is_provider,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
        }
    }

@auth_app.post("/api/v1/auth/refresh", tags=["authentication"])
async def refresh_token() -> Dict[str, Any]:
    """Refresh a token."""
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        is_active=True,
        is_provider=False,
        created_at="2023-06-01T12:00:00Z",
        updated_at="2023-06-01T12:00:00Z"
    )
    token = Token(
        access_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        token_type="bearer",
        user=user
    )
    return create_response(data=token, message="Token refreshed successfully")

@auth_app.post("/api/v1/auth/logout", tags=["authentication"])
async def logout() -> Dict[str, Any]:
    """Logout a user."""
    return create_response(data=None, message="Successfully logged out")

@auth_app.post("/api/v1/auth/reset-password", tags=["authentication"])
async def request_password_reset(email: EmailStr = Body(...)) -> Dict[str, Any]:
    """Request a password reset."""
    return create_response(
        data={"reset_token": "sample_reset_token"},
        message="Password reset requested. In production, an email would be sent."
    )

@auth_app.post("/api/v1/auth/reset-password/{token}", tags=["authentication"])
async def reset_password(token: str, new_password: str = Body(...)) -> Dict[str, Any]:
    """Reset a password."""
    return create_response(data=None, message="Password has been reset successfully")

@auth_app.get("/api/v1/auth/verify/{token}", tags=["authentication"])
async def verify_email(token: str) -> Dict[str, Any]:
    """Verify an email address."""
    return create_response(data=None, message="Email verified successfully")

@auth_app.get("/api/v1/users/me", tags=["users"])
async def get_current_user() -> Dict[str, Any]:
    """Get the current user."""
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        is_active=True,
        is_provider=False,
        created_at="2023-06-01T12:00:00Z",
        updated_at="2023-06-01T12:00:00Z"
    )
    return create_response(data=user, message="User profile retrieved successfully")

@auth_app.put("/api/v1/users/me", tags=["users"])
async def update_current_user(full_name: Optional[str] = Body(None), is_provider: Optional[bool] = Body(None)) -> Dict[str, Any]:
    """Update the current user."""
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        username="testuser",
        email="test@example.com",
        full_name=full_name or "Test User",
        is_active=True,
        is_provider=is_provider if is_provider is not None else False,
        created_at="2023-06-01T12:00:00Z",
        updated_at="2023-06-01T12:30:00Z"
    )
    return create_response(data=user, message="User profile updated successfully")

@auth_app.post("/api/v1/api-keys", tags=["api-keys"], status_code=status.HTTP_201_CREATED)
async def create_api_key(key_data: ApiKeyCreate) -> Dict[str, Any]:
    """Create a new API key."""
    api_key = ApiKey(
        id=uuid.uuid4(),
        name=key_data.name,
        key="qh_pk_1234567890abcdefghijklmnopqrstuvwxyz",
        created_at="2023-06-01T12:00:00Z",
        expires_at=key_data.expires_at,
        is_active=True
    )
    return create_response(data=api_key, message="API key created successfully")

@auth_app.get("/api/v1/api-keys", tags=["api-keys"])
async def get_api_keys() -> Dict[str, Any]:
    """Get all API keys."""
    api_keys = [
        ApiKey(
            id=uuid.uuid4(),
            name="Production API Key",
            key="qh_pk_************wxyz",
            created_at="2023-06-01T12:00:00Z",
            expires_at="2024-06-01T12:00:00Z",
            is_active=True
        ),
        ApiKey(
            id=uuid.uuid4(),
            name="Development API Key",
            key="qh_dk_************abcd",
            created_at="2023-06-01T12:30:00Z",
            expires_at=None,
            is_active=True
        )
    ]
    return create_response(data=api_keys, message="API keys retrieved successfully")

@auth_app.get("/api/v1/api-keys/{key_id}", tags=["api-keys"])
async def get_api_key(key_id: UUID) -> Dict[str, Any]:
    """Get an API key."""
    api_key = ApiKey(
        id=key_id,
        name="Production API Key",
        key="qh_pk_************wxyz",
        created_at="2023-06-01T12:00:00Z",
        expires_at="2024-06-01T12:00:00Z",
        is_active=True
    )
    return create_response(data=api_key, message="API key retrieved successfully")

@auth_app.put("/api/v1/api-keys/{key_id}", tags=["api-keys"])
async def update_api_key(key_id: UUID, name: Optional[str] = Body(None), is_active: Optional[bool] = Body(None)) -> Dict[str, Any]:
    """Update an API key."""
    api_key = ApiKey(
        id=key_id,
        name=name or "Production API Key",
        key="qh_pk_************wxyz",
        created_at="2023-06-01T12:00:00Z",
        expires_at="2024-06-01T12:00:00Z",
        is_active=is_active if is_active is not None else True
    )
    return create_response(data=api_key, message="API key updated successfully")

@auth_app.delete("/api/v1/api-keys/{key_id}", tags=["api-keys"])
async def delete_api_key(key_id: UUID) -> Dict[str, Any]:
    """Delete an API key."""
    return create_response(data=None, message="API key deleted successfully")

@auth_app.get("/api/v1/api-keys/usage/stats", tags=["api-keys"])
async def get_api_usage_stats() -> Dict[str, Any]:
    """Get API usage statistics."""
    stats = {
        "total_requests": 1250,
        "total_requests_limit": 50000,
        "compute_time_hours": 5.75,
        "compute_time_limit": 100.0
    }
    return create_response(data=stats, message="API usage statistics retrieved successfully")

# Project Service endpoints
@project_app.post("/api/v1/projects", tags=["projects"], status_code=status.HTTP_201_CREATED)
async def create_project(project_data: ProjectCreate) -> Dict[str, Any]:
    """Create a new project."""
    project = Project(
        id=uuid.uuid4(),
        name=project_data.name,
        description=project_data.description,
        repo=project_data.repo,
        created_at="2023-06-01T12:00:00Z",
        updated_at="2023-06-01T12:00:00Z"
    )
    return create_response(data=project, message="Project created successfully")

@project_app.get("/api/v1/projects", tags=["projects"])
async def get_projects() -> Dict[str, Any]:
    """Get all projects."""
    projects = [
        Project(
            id=uuid.uuid4(),
            name="Quantum Teleportation",
            description="A quantum teleportation circuit implementation",
            repo="https://github.com/user/quantum-teleportation",
            created_at="2023-06-01T12:00:00Z",
            updated_at="2023-06-01T12:00:00Z"
        ),
        Project(
            id=uuid.uuid4(),
            name="Quantum Error Correction",
            description="A quantum error correction implementation",
            repo="https://github.com/user/quantum-error-correction",
            created_at="2023-06-02T12:00:00Z",
            updated_at="2023-06-02T12:00:00Z"
        )
    ]
    return create_response(data=projects, message="Projects retrieved successfully")

@project_app.get("/api/v1/projects/{project_id}", tags=["projects"])
async def get_project(project_id: UUID) -> Dict[str, Any]:
    """Get a project."""
    project = Project(
        id=project_id,
        name="Quantum Teleportation",
        description="A quantum teleportation circuit implementation",
        repo="https://github.com/user/quantum-teleportation",
        created_at="2023-06-01T12:00:00Z",
        updated_at="2023-06-01T12:00:00Z"
    )
    return create_response(data=project, message="Project retrieved successfully")

@project_app.put("/api/v1/projects/{project_id}", tags=["projects"])
async def update_project(project_id: UUID, name: Optional[str] = Body(None), description: Optional[str] = Body(None)) -> Dict[str, Any]:
    """Update a project."""
    project = Project(
        id=project_id,
        name=name or "Quantum Teleportation",
        description=description or "A quantum teleportation circuit implementation",
        repo="https://github.com/user/quantum-teleportation",
        created_at="2023-06-01T12:00:00Z",
        updated_at="2023-06-01T12:30:00Z"
    )
    return create_response(data=project, message="Project updated successfully")

@project_app.delete("/api/v1/projects/{project_id}", tags=["projects"])
async def delete_project(project_id: UUID) -> Dict[str, Any]:
    """Delete a project."""
    return create_response(data=None, message="Project deleted successfully")

@project_app.post("/api/v1/projects/{project_id}/release", tags=["projects"])
async def release_project(project_id: UUID, release_data: ProjectRelease) -> Dict[str, Any]:
    """Release a project as a quantum app."""
    quantum_app = QuantumApp(
        id=uuid.uuid4(),
        name=release_data.name,
        description=release_data.description,
        type=release_data.type,
        status=["DRAFT"],
        visibility=release_data.visibility,
        created_at="2023-06-01T13:00:00Z",
        updated_at="2023-06-01T13:00:00Z"
    )
    return create_response(data=quantum_app, message="Project released successfully")

# Run the Auth Service
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run API documentation test server")
    parser.add_argument("--service", type=str, choices=["auth", "project"], default="auth", help="Service to run")
    parser.add_argument("--port", type=int, default=8001, help="Port to run the server on")

    args = parser.parse_args()

    if args.service == "auth":
        uvicorn.run(auth_app, host="0.0.0.0", port=args.port)
    else:
        uvicorn.run(project_app, host="0.0.0.0", port=args.port)
