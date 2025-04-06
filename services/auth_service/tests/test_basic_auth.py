"""
Basic authentication tests for the auth service.
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os
from pathlib import Path
import jwt
from datetime import datetime, timedelta
from unittest.mock import patch, AsyncMock, MagicMock
from passlib.context import CryptContext

# Add the parent directory to path so we can import the main module
sys.path.append(str(Path(__file__).parent.parent))
from main import app, verify_password, create_access_token

# Constants for testing
SECRET_KEY = "test_secret_key"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create a TestClient
client = TestClient(app)

def create_test_user():
    """Create a test user for testing."""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword", 
        "full_name": "Test User"
    }

def test_verify_password():
    """Test password verification."""
    password = "testpassword"
    hashed_password = pwd_context.hash(password)
    assert verify_password(password, hashed_password)
    assert not verify_password("wrongpassword", hashed_password)

def test_create_access_token():
    """Test token creation."""
    data = {"sub": "testuser"}
    expires_delta = timedelta(minutes=15)
    token = create_access_token(data, expires_delta)
    
    # Decode token to verify payload
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "testuser"
    assert "exp" in payload

def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_register_endpoint():
    """Test user registration endpoint with mocked database."""
    # Create a mock for the users_collection
    mock_users_collection = AsyncMock()
    mock_users_collection.find_one.return_value = None  # User doesn't exist
    mock_users_collection.insert_one.return_value = AsyncMock(inserted_id="test_id")
    
    # Apply the patch
    with patch('main.users_collection', mock_users_collection):
        user_data = create_test_user()
        response = client.post(
            "/register",
            json=user_data
        )
        
        assert response.status_code == 200
        result = response.json()
        assert result["username"] == user_data["username"]
        assert result["email"] == user_data["email"]
        assert "password" not in result
        
def test_register_duplicate_user():
    """Test user registration with duplicate username."""
    # Create a mock for the users_collection
    mock_users_collection = AsyncMock()
    # First call returns None (for checking username), second call returns a user (username exists)
    mock_users_collection.find_one.side_effect = [
        {"username": "testuser"},  # User exists
    ]
    
    # Apply the patch
    with patch('main.users_collection', mock_users_collection):
        user_data = create_test_user()
        response = client.post(
            "/register",
            json=user_data
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

def test_token_endpoint():
    """Test token endpoint with mocked database."""
    user_data = create_test_user()
    hashed_password = pwd_context.hash(user_data["password"])
    
    # Create a database user with hashed password
    db_user = {
        "username": user_data["username"],
        "email": user_data["email"],
        "hashed_password": hashed_password,
        "full_name": user_data["full_name"],
        "is_active": True
    }
    
    # Create a mock for the users_collection
    mock_users_collection = AsyncMock()
    mock_users_collection.find_one.return_value = db_user
    
    # Apply the patch
    with patch('main.users_collection', mock_users_collection):
        # Test successful login
        response = client.post(
            "/token",
            data={
                "username": user_data["username"],
                "password": user_data["password"]
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert response.status_code == 200
        result = response.json()
        assert "access_token" in result
        assert result["token_type"] == "bearer"

def test_token_invalid_credentials():
    """Test token endpoint with invalid credentials."""
    user_data = create_test_user()
    hashed_password = pwd_context.hash(user_data["password"])
    
    # Create a database user with hashed password
    db_user = {
        "username": user_data["username"],
        "email": user_data["email"],
        "hashed_password": hashed_password,
        "full_name": user_data["full_name"],
        "is_active": True
    }
    
    # Create a mock for the users_collection
    mock_users_collection = AsyncMock()
    mock_users_collection.find_one.return_value = db_user
    
    # Apply the patch
    with patch('main.users_collection', mock_users_collection):
        # Test invalid password
        response = client.post(
            "/token",
            data={
                "username": user_data["username"],
                "password": "wrongpassword"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert response.status_code == 401
        assert "Could not validate credentials" in response.json()["detail"]

def test_google_auth_url():
    """Test Google auth URL generation."""
    with patch('os.getenv', return_value="test-client-id"):
        response = client.get("/auth/google/url")
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "accounts.google.com" in data["url"]
        assert "test-client-id" in data["url"]
