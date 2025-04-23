"""
Basic setup tests for the Auth Service.

This module tests the basic application setup and configuration
to verify that all components are wired correctly.
"""
import pytest
import httpx
from sqlalchemy import text

from services.auth_service.app.core.config import settings
from services.auth_service.tests.test_main import app


@pytest.mark.asyncio
async def test_health_endpoint(test_client: httpx.AsyncClient):
    """Test the health check endpoint."""
    response = await test_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "auth_service"}


@pytest.mark.asyncio
async def test_api_docs_accessible(test_client: httpx.AsyncClient):
    """Test that the API documentation is accessible."""
    response = await test_client.get("/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


@pytest.mark.asyncio
async def test_openapi_schema(test_client: httpx.AsyncClient):
    """Test that the OpenAPI schema is accessible."""
    response = await test_client.get("/openapi.json")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    
    # Verify auth endpoints are defined in schema
    schema = response.json()
    auth_path = f"{settings.API_V1_STR}/auth/login"
    register_path = f"{settings.API_V1_STR}/auth/register"
    
    # Print paths for debugging
    print(f"Looking for paths: {auth_path} and {register_path}")
    print(f"Available paths: {list(schema.get('paths', {}).keys())}")
    
    # Assert paths exist
    assert auth_path in schema["paths"]
    assert register_path in schema["paths"]


@pytest.mark.asyncio
async def test_auth_routes_exist(test_client: httpx.AsyncClient):
    """Test that auth routes are properly configured."""
    # Test register endpoint exists (will return 422 for missing body)
    response = await test_client.post(f"{settings.API_V1_STR}/auth/register")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_user_routes_exist(test_client: httpx.AsyncClient):
    """Test that user routes are properly configured."""
    # Test /me endpoint exists (will return 401 for missing auth)
    response = await test_client.get(f"{settings.API_V1_STR}/users/me")
    assert response.status_code == 401
    assert "bearer" in response.headers["www-authenticate"].lower()


@pytest.mark.asyncio
async def test_database_connection(db_session):
    """Test that database connection is working."""
    # If this test doesn't raise an exception, the database connection is working
    assert db_session is not None
    # Using SQLAlchemy text() for proper SQL query construction
    result = await db_session.execute(text("SELECT 1"))
    assert result is not None
