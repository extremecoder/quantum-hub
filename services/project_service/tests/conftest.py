import pytest
import asyncio
from typing import Generator, Optional
from typing import Generator
from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timedelta
import jwt
import os
from passlib.context import CryptContext
from fastapi import FastAPI
from services.auth_service.main import app as auth_app
from services.project_service.main import app as project_app
from services.registry_service.main import app as registry_app
from services.marketplace_service.main import app as marketplace_app
from unittest.mock import AsyncMock, MagicMock, patch
import motor.motor_asyncio

# Constants
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_USER = os.getenv("MONGO_USER", "admin")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "password")
SECRET_KEY = os.getenv("SECRET_KEY", "test_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Add password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def mock_mongo_client():
    """Create a mock MongoDB client for testing."""
    mock_client = MagicMock()
    mock_db = MagicMock()
    
    # Setup collections
    mock_users_collection = AsyncMock()
    mock_projects_collection = AsyncMock()
    mock_registry_collection = AsyncMock()
    mock_offerings_collection = AsyncMock()
    
    # Configure find_one to return None by default (user not found)
    mock_users_collection.find_one.return_value = None
    mock_projects_collection.find_one.return_value = None
    mock_registry_collection.find_one.return_value = None
    mock_offerings_collection.find_one.return_value = None
    
    # Configure find to return empty cursor
    mock_users_collection.find.return_value = AsyncMock(__aiter__=AsyncMock(return_value=AsyncMock(__anext__=AsyncMock(side_effect=StopAsyncIteration))))
    mock_projects_collection.find.return_value = AsyncMock(__aiter__=AsyncMock(return_value=AsyncMock(__anext__=AsyncMock(side_effect=StopAsyncIteration))))
    mock_registry_collection.find.return_value = AsyncMock(__aiter__=AsyncMock(return_value=AsyncMock(__anext__=AsyncMock(side_effect=StopAsyncIteration))))
    mock_offerings_collection.find.return_value = AsyncMock(__aiter__=AsyncMock(return_value=AsyncMock(__anext__=AsyncMock(side_effect=StopAsyncIteration))))
    
    # Configure insert_one to return a result with an inserted_id
    mock_users_collection.insert_one.return_value = AsyncMock(inserted_id=ObjectId())
    mock_projects_collection.insert_one.return_value = AsyncMock(inserted_id=ObjectId())
    mock_registry_collection.insert_one.return_value = AsyncMock(inserted_id=ObjectId())
    mock_offerings_collection.insert_one.return_value = AsyncMock(inserted_id=ObjectId())
    
    # Attach collections to db
    mock_db.users = mock_users_collection
    mock_db.projects = mock_projects_collection
    mock_db.registry = mock_registry_collection
    mock_db.offerings = mock_offerings_collection
    
    # Configure client to return the db
    mock_client.__getitem__.return_value = mock_db
    
    return mock_client

@pytest.fixture
def test_user():
    """Create a test user for testing."""
    user_id = ObjectId()
    password = "testpassword"
    return {
        "_id": user_id,
        "id": str(user_id),
        "username": "testuser",
        "email": "test@example.com",
        "password": password,  # Plain password for testing
        "hashed_password": pwd_context.hash(password),
        "is_active": True,
        "is_provider": False,
        "full_name": "Test User",
        "created_at": datetime.utcnow() + timedelta(days=365),  # Future date for testing
        "updated_at": datetime.utcnow()
    }

@pytest.fixture
def test_provider():
    """Create a test provider for testing."""
    provider_id = ObjectId()
    password = "testpassword"
    return {
        "_id": provider_id,
        "id": str(provider_id),
        "username": "testprovider",
        "email": "provider@example.com",
        "password": password,  # Plain password for testing
        "hashed_password": pwd_context.hash(password),
        "is_active": True,
        "is_provider": True,
        "full_name": "Test Provider",
        "created_at": datetime.utcnow() + timedelta(days=365),  # Future date for testing
        "updated_at": datetime.utcnow()
    }

@pytest.fixture
def test_project():
    """Create a test project for testing."""
    project_id = ObjectId()
    return {
        "_id": project_id,
        "id": str(project_id),
        "name": "Test Project",
        "description": "Test Description",
        "owner_id": "test_user_id",
        "quantum_backend": "ibmq_qasm_simulator",
        "created_at": datetime.utcnow() + timedelta(days=365),  # Future date for testing
        "updated_at": datetime.utcnow() + timedelta(days=365),  # Future date for testing
        "files": []
    }

@pytest.fixture
def test_registry_item():
    """Create a test registry item for testing."""
    item_id = ObjectId()
    return {
        "_id": item_id,
        "id": str(item_id),
        "name": "Quantum Circuit",
        "description": "Basic quantum circuit with gates",
        "type": "circuit",
        "tags": ["quantum", "circuit", "gates"],
        "version": "1.0.0",
        "license": "MIT",
        "dependencies": [],
        "metadata": {"qubits": 2, "gates": ["h", "cx"]},
        "content": "OPENQASM 2.0;\ninclude \"qelib1.inc\";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0], q[1];\nmeasure q -> c;\n",
        "content_type": "qasm"
    }

@pytest.fixture
def test_offering():
    """Create a test marketplace offering for testing."""
    offering_id = ObjectId()
    return {
        "_id": offering_id,
        "id": str(offering_id),
        "name": "Quantum Simulator",
        "description": "High-performance quantum simulator",
        "provider_id": "test_provider_id",
        "category": "simulator",
        "tags": ["quantum", "simulator", "high-performance"],
        "pricing_tiers": [
            {"name": "basic", "price": 0, "description": "Free tier", "features": ["1 qubit", "Basic gates"]},
            {"name": "premium", "price": 9.99, "description": "Premium tier", "features": ["5 qubits", "All gates", "Noise simulation"]}
        ],
        "api_endpoint": "https://api.example.com/simulator",
        "status": "active"
    }

@pytest.fixture
def create_test_token():
    """Create a test JWT token."""
    def _create_token(data: dict, expires_delta: timedelta = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    return _create_token

@pytest.fixture
def test_client(mock_mongo_client):
    """Create a test client for testing auth service."""
    from services.auth_service.main import app
    
    # Apply the patch to replace the MongoDB client
    with patch('services.auth_service.main.client', mock_mongo_client):
        with patch('services.auth_service.main.users_collection', mock_mongo_client['quantum_hub_test'].users):
            client = TestClient(app)
            yield client
            
@pytest.fixture
def project_test_client(mock_mongo_client, test_user):
    """Create a test client for testing project service."""
    from services.project_service.main import app, get_current_user
    
    # Apply the patch to replace the MongoDB client
    with patch('services.project_service.main.client', mock_mongo_client):
        with patch('services.project_service.main.projects_collection', mock_mongo_client['quantum_hub_test'].projects):
            # Override the dependency for authentication
            app.dependency_overrides[get_current_user] = lambda: test_user["id"]
            
            client = TestClient(app)
            yield client
            
            # Clean up
            app.dependency_overrides = {}
            
@pytest.fixture
def project_test_client_no_auth(mock_mongo_client):
    """Create a test client for testing project service without authentication bypass."""
    from services.project_service.main import app
    
    # Apply the patch to replace the MongoDB client
    with patch('services.project_service.main.client', mock_mongo_client):
        with patch('services.project_service.main.projects_collection', mock_mongo_client['quantum_hub_test'].projects):
            client = TestClient(app)
            yield client
            
@pytest.fixture
def registry_test_client(mock_mongo_client):
    """Create a test client for testing registry service."""
    from services.registry_service.main import app
    
    # Apply the patch to replace the MongoDB client
    with patch('services.registry_service.main.client', mock_mongo_client):
        with patch('services.registry_service.main.registry_collection', mock_mongo_client['quantum_hub_test'].registry):
            client = TestClient(app)
            yield client
            
@pytest.fixture
def marketplace_test_client(mock_mongo_client):
    """Create a test client for testing marketplace service."""
    from services.marketplace_service.main import app
    
    # Apply the patch to replace the MongoDB client
    with patch('services.marketplace_service.main.client', mock_mongo_client):
        with patch('services.marketplace_service.main.offerings_collection', mock_mongo_client['quantum_hub_test'].offerings):
            client = TestClient(app)
            yield client

@pytest.fixture
def provider_test_client(mock_mongo_client, test_provider):
    """Create a test client with provider authentication."""
    from services.project_service.main import app, get_current_user
    
    # Apply the patch to replace the MongoDB client
    with patch('services.project_service.main.client', mock_mongo_client):
        with patch('services.project_service.main.projects_collection', mock_mongo_client['quantum_hub_test'].projects):
            # Override the dependency for authentication - use provider ID
            app.dependency_overrides[get_current_user] = lambda: test_provider["id"]
            
            client = TestClient(app)
            yield client
            
            # Clean up
            app.dependency_overrides = {}