"""
Tests for the Auth Service API key endpoints.

This module contains tests for the API key endpoints, including
creating, retrieving, updating, and deleting API keys.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from services.shared.database.models import User, UserApiKey


@pytest.mark.asyncio
async def test_create_api_key(client: AsyncClient, token_headers: dict):
    """Test API key creation."""
    # Create API key data
    key_data = {
        "name": "Test API Key",
        "expires_at": None
    }
    
    # Send create request
    response = await client.post(
        "/api/v1/api-keys",
        json=key_data,
        headers=token_headers
    )
    
    # Check response
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "API key created successfully"
    assert data["data"]["name"] == key_data["name"]
    assert "key" in data["data"]
    assert data["data"]["is_active"] is True


@pytest.mark.asyncio
async def test_get_api_keys(client: AsyncClient, token_headers: dict, test_api_key: UserApiKey):
    """Test retrieving API keys."""
    # Send get request
    response = await client.get(
        "/api/v1/api-keys",
        headers=token_headers
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "API keys retrieved successfully"
    assert len(data["data"]) >= 1
    
    # Check that the key is masked
    key = data["data"][0]
    assert key["name"] == test_api_key.name
    assert "*" in key["key"]  # Key should be masked


@pytest.mark.asyncio
async def test_get_api_key(client: AsyncClient, token_headers: dict, test_api_key: UserApiKey):
    """Test retrieving a specific API key."""
    # Send get request
    response = await client.get(
        f"/api/v1/api-keys/{test_api_key.id}",
        headers=token_headers
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "API key retrieved successfully"
    assert data["data"]["name"] == test_api_key.name
    assert "*" in data["data"]["key"]  # Key should be masked


@pytest.mark.asyncio
async def test_update_api_key(client: AsyncClient, token_headers: dict, test_api_key: UserApiKey):
    """Test updating an API key."""
    # Create update data
    update_data = {
        "name": "Updated API Key",
        "is_active": False
    }
    
    # Send update request
    response = await client.put(
        f"/api/v1/api-keys/{test_api_key.id}",
        json=update_data,
        headers=token_headers
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "API key updated successfully"
    assert data["data"]["name"] == update_data["name"]
    assert data["data"]["is_active"] == update_data["is_active"]


@pytest.mark.asyncio
async def test_delete_api_key(client: AsyncClient, token_headers: dict, test_api_key: UserApiKey):
    """Test deleting an API key."""
    # Send delete request
    response = await client.delete(
        f"/api/v1/api-keys/{test_api_key.id}",
        headers=token_headers
    )
    
    # Check response
    assert response.status_code == 204
    
    # Verify key is deleted
    response = await client.get(
        f"/api/v1/api-keys/{test_api_key.id}",
        headers=token_headers
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_api_usage_stats(client: AsyncClient, token_headers: dict):
    """Test retrieving API usage statistics."""
    # Send get request
    response = await client.get(
        "/api/v1/api-keys/usage/stats",
        headers=token_headers
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "API usage statistics retrieved successfully"
    assert "total_requests" in data["data"]
    assert "total_requests_limit" in data["data"]
    assert "compute_time_hours" in data["data"]
    assert "compute_time_limit" in data["data"]
