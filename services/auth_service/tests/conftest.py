"""
Test fixtures for the Auth Service.

This module provides pytest fixtures for testing the Auth Service.
"""
import asyncio
import os
from datetime import datetime, timedelta
from typing import AsyncGenerator, Generator

import jwt
import pytest
import httpx
from fastapi import FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Add the project root to the path
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

# Import the test app 
from services.auth_service.tests.test_main import app
from services.auth_service.app.core.config import settings
from services.auth_service.app.core.database import get_db
# Import the SQLite-compatible test models instead of the PostgreSQL models
from services.auth_service.tests.test_models import TestBase, User

# Test database URL - use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine and session factory
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
)

TestingSessionLocal = sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def db_session() -> AsyncSession:
    """Create a fresh SQLAlchemy session for each test."""
    # Create all tables
    async with test_engine.begin() as conn:
        # Use the TestBase from test_models
        await conn.run_sync(TestBase.metadata.create_all)
    
    # Create session
    async with TestingSessionLocal() as session:
        yield session
        
    # Drop all tables after test is complete
    async with test_engine.begin() as conn:
        await conn.run_sync(TestBase.metadata.drop_all)


@pytest.fixture
async def test_client() -> AsyncGenerator:
    """Create a test client for the FastAPI app."""
    # Override the get_db dependency to use the test session
    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session
            
    app.dependency_overrides[get_db] = override_get_db
    
    # Create test client using httpx.AsyncClient directly
    # AsyncClient doesn't support 'app' parameter, so we need to use transport
    async with httpx.AsyncClient(base_url="http://testserver") as client:
        yield client
    
    # Cleanup
    app.dependency_overrides = {}


@pytest.fixture
def test_user() -> dict:
    """Create a test user for testing."""
    return {
        "id": "00000000-0000-0000-0000-000000000001",
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword",  # Plain password for testing
        "hashed_password": CryptContext(schemes=["bcrypt"], deprecated="auto").hash("testpassword"),
        "full_name": "Test User",
        "is_active": True,
        "is_provider": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }


@pytest.fixture
def create_test_token():
    """Create a test JWT token."""
    def _create_token(data: dict, expires_delta: timedelta = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    return _create_token