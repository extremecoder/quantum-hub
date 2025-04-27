"""
Test configuration for the Auth Service.

This module provides pytest fixtures for testing the Auth Service.
"""
import asyncio
import os
import uuid
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from services.auth_service.app.main import app
from services.auth_service.app.core.database import get_db
from services.auth_service.app.models.database import Base
from services.shared.utils.password import hash_password

# Use PostgreSQL for testing
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/quantum_hub_test"
)

# Create async engine for testing
engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=NullPool,
    future=True
)

# Create async session factory
TestingSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a fresh database session for a test.
    Creates all tables before the test and drops them after.

    Yields:
        AsyncSession: Database session.
    """
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Create session
    async with TestingSessionLocal() as session:
        yield session

    # Drop all tables after the test
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create a test client with a custom dependency override.

    Args:
        db_session: Database session fixture.

    Yields:
        AsyncClient: Test client.
    """
    # Override the get_db dependency
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    # Create async client
    async with AsyncClient(base_url="http://test") as client:
        yield client

    # Clear dependency overrides
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> object:
    """
    Create a test user.

    Args:
        db_session: Database session fixture.

    Returns:
        User: Test user.
    """
    from services.auth_service.app.models.database import User
    from services.auth_service.app.repositories.user import create_user
    from services.auth_service.app.models.schemas import UserCreate

    # Create a test user using the repository function
    user_create = UserCreate(
        username="testuser",
        email="test@example.com",
        password="password123",
        full_name="Test User"
    )

    user = await create_user(
        db=db_session,
        username=user_create.username,
        email=user_create.email,
        password=user_create.password,
        full_name=user_create.full_name,
        is_active=True,
        is_provider=False
    )

    await db_session.commit()

    return user


@pytest_asyncio.fixture
async def test_api_key(db_session: AsyncSession, test_user) -> object:
    """
    Create a test API key.

    Args:
        db_session: Database session fixture.
        test_user: Test user fixture.

    Returns:
        object: Test API key object.
    """
    from services.auth_service.app.repositories.api_key import create_api_key
    from services.auth_service.app.models.schemas import ApiKeyCreate

    # Create a test API key using the repository function
    api_key_create = ApiKeyCreate(
        name="Test API Key",
        expires_at=None
    )

    api_key = await create_api_key(
        db=db_session,
        user_id=test_user.id,
        key_data=api_key_create
    )

    await db_session.commit()

    return api_key


@pytest_asyncio.fixture
async def token_headers(test_user) -> dict:
    """
    Create authorization headers with a JWT token for the test user.

    Args:
        test_user: Test user fixture.

    Returns:
        dict: Headers with authorization token.
    """
    from services.auth_service.app.repositories.token import create_access_token

    # Create access token
    access_token = create_access_token(
        user_id=str(test_user.id),
        username=test_user.username,
        email=test_user.email,
        roles=["CONSUMER", "DEVELOPER"]
    )

    # Create headers
    headers = {"Authorization": f"Bearer {access_token}"}

    return headers
