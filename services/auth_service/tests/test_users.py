"""
Tests for the Auth Service user endpoints.

This module contains tests for the user endpoints, including
retrieving and updating user profiles.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from services.shared.database.models import User


@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient, token_headers: dict, test_user: User):
    """Test retrieving current user profile."""
    # Send get request
    response = await client.get(
        "/api/v1/users/me",
        headers=token_headers
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User profile retrieved successfully"
    assert data["data"]["username"] == test_user.username
    assert data["data"]["email"] == test_user.email
    assert data["data"]["full_name"] == test_user.full_name


@pytest.mark.asyncio
async def test_update_current_user(client: AsyncClient, token_headers: dict, test_user: User):
    """Test updating current user profile."""
    # Create update data
    update_data = {
        "full_name": "Updated User",
        "is_provider": True
    }
    
    # Send update request
    response = await client.put(
        "/api/v1/users/me",
        json=update_data,
        headers=token_headers
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User profile updated successfully"
    assert data["data"]["full_name"] == update_data["full_name"]
    assert data["data"]["is_provider"] == update_data["is_provider"]
    
    # Verify username and email remain unchanged
    assert data["data"]["username"] == test_user.username
    assert data["data"]["email"] == test_user.email
