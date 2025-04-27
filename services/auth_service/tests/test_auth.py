"""
Tests for the Auth Service authentication endpoints.

This module contains tests for the authentication endpoints, including
registration, login, token refresh, and logout.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from services.shared.database.models import User


@pytest.mark.asyncio
async def test_register(client: AsyncClient, db_session: AsyncSession):
    """Test user registration."""
    # Create registration data
    user_data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "password123",
        "full_name": "New User",
        "is_active": True,
        "is_provider": False
    }
    
    # Send registration request
    response = await client.post("/api/v1/auth/register", json=user_data)
    
    # Check response
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "User registered successfully"
    assert data["data"]["user"]["username"] == user_data["username"]
    assert data["data"]["user"]["email"] == user_data["email"]
    assert data["data"]["user"]["full_name"] == user_data["full_name"]
    assert "access_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login(client: AsyncClient, test_user: User):
    """Test user login."""
    # Create login data
    login_data = {
        "username": test_user.username,
        "password": "password123"
    }
    
    # Send login request
    response = await client.post(
        "/api/v1/auth/login",
        data=login_data,  # Use form data for OAuth2 password flow
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Login successful"
    assert data["data"]["user"]["username"] == test_user.username
    assert data["data"]["user"]["email"] == test_user.email
    assert "access_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, token_headers: dict):
    """Test token refresh."""
    # Send refresh request
    response = await client.post(
        "/api/v1/auth/refresh",
        headers=token_headers
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Token refreshed successfully"
    assert "access_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, token_headers: dict):
    """Test user logout."""
    # Send logout request
    response = await client.post(
        "/api/v1/auth/logout",
        headers=token_headers
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Successfully logged out"


@pytest.mark.asyncio
async def test_reset_password_request(client: AsyncClient, test_user: User):
    """Test password reset request."""
    # Send password reset request
    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"email": test_user.email}
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    # In development mode, we return the token
    assert "reset_token" in data["data"]
    assert data["message"] == "Password reset requested. In production, an email would be sent."


@pytest.mark.asyncio
async def test_reset_password_complete(client: AsyncClient):
    """Test password reset completion."""
    # Send password reset completion request
    response = await client.post(
        "/api/v1/auth/reset-password/test_token",
        json={"new_password": "newpassword123"}
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Password has been reset successfully"


@pytest.mark.asyncio
async def test_verify_email(client: AsyncClient):
    """Test email verification."""
    # Send email verification request
    response = await client.get(
        "/api/v1/auth/verify/test_token"
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Email verified successfully"
