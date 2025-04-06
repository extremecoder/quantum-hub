"""
Tests for social authentication functionality in the auth service.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
import json
from datetime import datetime
from bson import ObjectId

# Use the same keys as in test_auth.py
SECRET_KEY = "test_secret_key"
ALGORITHM = "HS256"

class MockResponse:
    """Mock response for httpx client"""
    def __init__(self, status_code, json_data):
        self.status_code = status_code
        self._json_data = json_data
        self.text = json.dumps(json_data)
        
    def json(self):
        return self._json_data

def test_google_auth_url(test_client):
    """Test generating Google auth URL"""
    with patch("os.getenv") as mock_getenv:
        mock_getenv.return_value = "test_client_id"
        response = test_client.get("/auth/google/url")
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "test_client_id" in data["url"]
        assert "accounts.google.com" in data["url"]

@pytest.mark.asyncio
async def test_google_auth_callback_new_user(test_client, mock_mongo_client):
    """Test Google OAuth callback for a new user"""
    # Mock environment variables
    with patch("os.getenv") as mock_getenv:
        mock_getenv.side_effect = lambda key, default=None: {
            "GOOGLE_CLIENT_ID": "test_client_id", 
            "GOOGLE_CLIENT_SECRET": "test_client_secret",
            "SECRET_KEY": SECRET_KEY,
            "ALGORITHM": ALGORITHM
        }.get(key, default)
        
        # Mock httpx client for token exchange and user info
        with patch("httpx.AsyncClient") as mock_client:
            mock_instance = MagicMock()
            mock_instance.__aenter__.return_value = mock_instance
            mock_instance.__aexit__.return_value = None
            
            # Mock token response
            mock_instance.post.return_value = MockResponse(200, {
                "access_token": "test_access_token",
                "token_type": "Bearer",
                "expires_in": 3600
            })
            
            # Mock user info response
            mock_instance.get.return_value = MockResponse(200, {
                "id": "123456789",
                "email": "test@example.com",
                "name": "Test User",
                "picture": "https://example.com/picture.jpg"
            })
            
            mock_client.return_value = mock_instance
            
            # Configure MongoDB mock
            users_collection = mock_mongo_client['quantum_hub_test'].users
            
            # No existing user found
            users_collection.find_one.return_value = None
            
            # Mock insert for new user
            mock_id = ObjectId()
            users_collection.insert_one.return_value = AsyncMock(inserted_id=mock_id)
            
            # Make the request
            response = test_client.post(
                "/auth/google/callback",
                json={"code": "test_auth_code"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert "token_type" in data
            assert data["token_type"] == "bearer"
            assert "user" in data
            assert data["user"]["email"] == "test@example.com"
            assert data["user"]["auth_provider"] == "google"

@pytest.mark.asyncio
async def test_google_auth_callback_existing_user(test_client, mock_mongo_client):
    """Test Google OAuth callback for an existing user"""
    # Mock environment variables
    with patch("os.getenv") as mock_getenv:
        mock_getenv.side_effect = lambda key, default=None: {
            "GOOGLE_CLIENT_ID": "test_client_id", 
            "GOOGLE_CLIENT_SECRET": "test_client_secret",
            "SECRET_KEY": SECRET_KEY,
            "ALGORITHM": ALGORITHM
        }.get(key, default)
        
        # Mock httpx client for token exchange and user info
        with patch("httpx.AsyncClient") as mock_client:
            mock_instance = MagicMock()
            mock_instance.__aenter__.return_value = mock_instance
            mock_instance.__aexit__.return_value = None
            
            # Mock token response
            mock_instance.post.return_value = MockResponse(200, {
                "access_token": "test_access_token",
                "token_type": "Bearer",
                "expires_in": 3600
            })
            
            # Mock user info response
            mock_instance.get.return_value = MockResponse(200, {
                "id": "123456789",
                "email": "test@example.com",
                "name": "Test User",
                "picture": "https://example.com/picture.jpg"
            })
            
            mock_client.return_value = mock_instance
            
            # Configure MongoDB mock
            users_collection = mock_mongo_client['quantum_hub_test'].users
            
            # Existing user found
            existing_user = {
                "_id": ObjectId(),
                "username": "google_123456789",
                "email": "test@example.com",
                "full_name": "Test User",
                "auth_provider": "google",
                "provider_user_id": "123456789",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            users_collection.find_one.return_value = existing_user
            
            # Make the request
            response = test_client.post(
                "/auth/google/callback",
                json={"code": "test_auth_code"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert "token_type" in data
            assert data["token_type"] == "bearer"
            assert "user" in data
            assert data["user"]["email"] == "test@example.com"
            assert data["user"]["auth_provider"] == "google"
            assert data["user"]["provider_user_id"] == "123456789"

@pytest.mark.asyncio
async def test_google_auth_callback_error(test_client):
    """Test Google OAuth callback error handling"""
    # Mock environment variables
    with patch("os.getenv") as mock_getenv:
        mock_getenv.side_effect = lambda key, default=None: {
            "GOOGLE_CLIENT_ID": "test_client_id", 
            "GOOGLE_CLIENT_SECRET": "test_client_secret",
            "SECRET_KEY": SECRET_KEY,
            "ALGORITHM": ALGORITHM
        }.get(key, default)
        
        # Mock httpx client for token exchange error
        with patch("httpx.AsyncClient") as mock_client:
            mock_instance = MagicMock()
            mock_instance.__aenter__.return_value = mock_instance
            mock_instance.__aexit__.return_value = None
            
            # Mock error response
            mock_instance.post.return_value = MockResponse(400, {
                "error": "invalid_grant",
                "error_description": "Invalid authorization code"
            })
            
            mock_client.return_value = mock_instance
            
            # Make the request
            response = test_client.post(
                "/auth/google/callback",
                json={"code": "invalid_auth_code"}
            )
            
            assert response.status_code == 400
            data = response.json()
            assert "detail" in data
            assert "Failed to get token" in data["detail"]
