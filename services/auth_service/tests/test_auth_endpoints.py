"""
Tests for the Auth Service API endpoints.

This module provides tests for the Auth Service API endpoints.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from services.auth_service.app.models.schemas import UserCreate, TokenResponse


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test the health check endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["service"] == "auth_service"


@pytest.mark.asyncio
async def test_api_v1_health_check(client: AsyncClient):
    """Test the API v1 health check endpoint."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["service"] == "auth_service"


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, db_session: AsyncSession):
    """Test user registration."""
    user_data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "password123",
        "full_name": "New User"
    }
    
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201
    
    data = response.json()
    assert "data" in data
    assert "access_token" in data["data"]
    assert "token_type" in data["data"]
    assert data["data"]["token_type"] == "bearer"
    assert "user" in data["data"]
    assert data["data"]["user"]["username"] == "newuser"
    assert data["data"]["user"]["email"] == "newuser@example.com"
    assert data["data"]["user"]["full_name"] == "New User"


@pytest.mark.asyncio
async def test_login_user(client: AsyncClient, test_user):
    """Test user login."""
    login_data = {
        "username": "testuser",
        "password": "password123"
    }
    
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "data" in data
    assert "access_token" in data["data"]
    assert "token_type" in data["data"]
    assert data["data"]["token_type"] == "bearer"
    assert "user" in data["data"]
    assert data["data"]["user"]["username"] == "testuser"


@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient, token_headers, test_user):
    """Test getting the current user."""
    response = await client.get("/api/v1/users/me", headers=token_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert "data" in data
    assert data["data"]["username"] == test_user.username
    assert data["data"]["email"] == test_user.email


@pytest.mark.asyncio
async def test_create_api_key(client: AsyncClient, token_headers):
    """Test creating an API key."""
    api_key_data = {
        "name": "New API Key",
        "expires_at": None
    }
    
    response = await client.post("/api/v1/api-keys", json=api_key_data, headers=token_headers)
    assert response.status_code == 201
    
    data = response.json()
    assert "data" in data
    assert "id" in data["data"]
    assert "key" in data["data"]
    assert "name" in data["data"]
    assert data["data"]["name"] == "New API Key"


@pytest.mark.asyncio
async def test_get_api_keys(client: AsyncClient, token_headers, test_api_key):
    """Test getting API keys."""
    response = await client.get("/api/v1/api-keys", headers=token_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert "data" in data
    assert len(data["data"]) >= 1
    
    # Check that the test API key is in the list
    api_key_found = False
    for api_key in data["data"]:
        if api_key["name"] == "Test API Key":
            api_key_found = True
            break
    
    assert api_key_found, "Test API key not found in the list"


@pytest.mark.asyncio
async def test_get_api_key(client: AsyncClient, token_headers, test_api_key):
    """Test getting a specific API key."""
    response = await client.get(f"/api/v1/api-keys/{test_api_key.id}", headers=token_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert "data" in data
    assert data["data"]["id"] == str(test_api_key.id)
    assert data["data"]["name"] == test_api_key.name
