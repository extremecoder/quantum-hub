import pytest
from fastapi.testclient import TestClient
import jwt
from datetime import datetime, timedelta
from unittest.mock import patch, AsyncMock

# Use the same secret key as in conftest.py
SECRET_KEY = "test_secret_key"
ALGORITHM = "HS256"

def create_test_token(user_id, expires_delta: timedelta = None):
    """Create a test JWT token for authentication."""
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + (expires_delta or timedelta(minutes=30)),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def test_register_user(test_client, test_user, mock_mongo_client):
    user_data = test_user
    users_collection = mock_mongo_client['quantum_hub_test'].users
    
    # Configure the mock to return None for find_one (user doesn't exist)
    users_collection.find_one.return_value = None
    
    # Configure the mock to return the user data after creation
    users_collection.insert_one.return_value = AsyncMock(inserted_id=user_data["_id"])
    
    response = test_client.post(
        "/register",
        json={
            "email": user_data["email"],
            "username": user_data["username"],
            "password": user_data["password"],
            "full_name": user_data["full_name"]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["username"] == user_data["username"]
    assert data["full_name"] == user_data["full_name"]
    assert "password" not in data

def test_register_duplicate_user(test_client, test_user, mock_mongo_client):
    user_data = test_user
    users_collection = mock_mongo_client['quantum_hub_test'].users
    
    # First check: Configure the mock to return None for find_one (user doesn't exist)
    users_collection.find_one.return_value = None
    
    # First registration
    test_client.post(
        "/register",
        json={
            "email": user_data["email"],
            "username": user_data["username"],
            "password": user_data["password"],
            "full_name": user_data["full_name"]
        }
    )
    
    # Second check: Configure the mock to return the user (user already exists)
    users_collection.find_one.return_value = user_data
    
    # Attempt to register with same username
    response = test_client.post(
        "/register",
        json={
            "email": "other@example.com",
            "username": user_data["username"],
            "password": user_data["password"],
            "full_name": user_data["full_name"]
        }
    )
    assert response.status_code == 400
    assert "Username already registered" in response.json()["detail"]

def test_login_user(test_client, test_user, mock_mongo_client):
    user_data = test_user
    users_collection = mock_mongo_client['quantum_hub_test'].users
    
    # First check: Configure the mock to return None for find_one (user doesn't exist)
    users_collection.find_one.return_value = None
    
    # Register user first
    test_client.post(
        "/register",
        json={
            "email": user_data["email"],
            "username": user_data["username"],
            "password": user_data["password"],
            "full_name": user_data["full_name"]
        }
    )
    
    # Configure the mock to return the user for authentication
    users_collection.find_one.return_value = user_data
    
    # Login
    response = test_client.post(
        "/token",
        data={
            "username": user_data["username"],
            "password": user_data["password"]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(test_client, test_user, mock_mongo_client):
    user_data = test_user
    users_collection = mock_mongo_client['quantum_hub_test'].users
    
    # Configure the mock to return the user
    users_collection.find_one.return_value = user_data
    
    response = test_client.post(
        "/token",
        data={
            "username": user_data["username"],
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]

def test_get_current_user(test_client, test_user, mock_mongo_client):
    user_data = test_user
    users_collection = mock_mongo_client['quantum_hub_test'].users
    
    # First check: Configure the mock to return None for find_one (user doesn't exist)
    users_collection.find_one.return_value = None
    
    # Register and login user
    test_client.post(
        "/register",
        json={
            "email": user_data["email"],
            "username": user_data["username"],
            "password": user_data["password"],
            "full_name": user_data["full_name"]
        }
    )
    
    # Configure the mock to return the user for token authentication
    users_collection.find_one.return_value = user_data
    
    token = create_test_token(user_data["username"])
    response = test_client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"]
    assert "password" not in data

def test_get_current_user_invalid_token(test_client):
    response = test_client.get(
        "/users/me",
        headers={"Authorization": "Bearer invalidtoken"}
    )
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]

def test_get_current_user_expired_token(test_client, test_user):
    user_data = test_user
    
    # Create an expired token
    token = create_test_token(
        user_data["username"],
        expires_delta=timedelta(minutes=-1)
    )
    
    # The service will automatically detect the expired token
    response = test_client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"] 