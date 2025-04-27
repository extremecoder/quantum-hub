"""
Test configuration for the Project Service.

This module provides pytest fixtures for testing the Project Service.
"""
import asyncio
import os
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from uuid import UUID

from services.project_service.app.main import app
from services.project_service.app.core.config import settings
from services.project_service.app.core.database import get_db
from services.project_service.app.core.security import get_current_user_id
from services.shared.database.base import Base
from services.shared.database.models import User, Project, QuantumApp, AppVersion
from services.shared.utils.password import hash_password

# Use an in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create async engine for testing
engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=NullPool,
    future=True,
    connect_args={"check_same_thread": False}
)

# Create async session factory
TestingSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a fresh database session for a test.

    Yields:
        AsyncSession: Database session.
    """
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Create session
    async with TestingSessionLocal() as session:
        yield session

    # Drop tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """
    Create a test user.

    Args:
        db_session: Database session fixture.

    Returns:
        User: Test user.
    """
    # Create test user
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=hash_password("password123"),
        full_name="Test User",
        is_active=True,
        roles=["CONSUMER", "DEVELOPER"]
    )

    # Add to database
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return user


@pytest_asyncio.fixture
async def client(db_session: AsyncSession, test_user: User) -> AsyncGenerator[AsyncClient, None]:
    """
    Create a test client with a custom dependency override.

    Args:
        db_session: Database session fixture.
        test_user: Test user fixture.

    Yields:
        AsyncClient: Test client.
    """
    # Override the get_db dependency
    async def override_get_db():
        yield db_session

    # Override the get_current_user_id dependency
    async def override_get_current_user_id():
        return test_user.id

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user_id] = override_get_current_user_id

    # Create test client
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

    # Clear dependency overrides
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_project(db_session: AsyncSession, test_user: User) -> Project:
    """
    Create a test project.

    Args:
        db_session: Database session fixture.
        test_user: Test user fixture.

    Returns:
        Project: Test project.
    """
    # Create test project
    project = Project(
        user_id=test_user.id,
        name="Test Project",
        description="A test project",
        repo="https://github.com/test/test-project"
    )

    # Add to database
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)

    return project


@pytest_asyncio.fixture
async def test_quantum_app(db_session: AsyncSession, test_user: User, test_project: Project) -> QuantumApp:
    """
    Create a test quantum app.

    Args:
        db_session: Database session fixture.
        test_user: Test user fixture.
        test_project: Test project fixture.

    Returns:
        QuantumApp: Test quantum app.
    """
    # Create test quantum app
    quantum_app = QuantumApp(
        developer_id=test_user.id,
        name="Test Quantum App",
        description="A test quantum app",
        type="CIRCUIT",
        status=["DRAFT"],
        visibility="PRIVATE"
    )

    # Add to database
    db_session.add(quantum_app)
    await db_session.commit()
    await db_session.refresh(quantum_app)

    # Create test app version
    app_version = AppVersion(
        quantum_app_id=quantum_app.id,
        version_number="1.0.0",
        sdk_used="QISKIT",
        is_latest=True
    )

    # Add to database
    db_session.add(app_version)
    await db_session.commit()
    await db_session.refresh(app_version)

    # Update quantum app with latest version
    quantum_app.latest_version_id = app_version.id
    await db_session.commit()
    await db_session.refresh(quantum_app)

    # Update project with quantum app
    test_project.quantum_app_id = quantum_app.id
    await db_session.commit()
    await db_session.refresh(test_project)

    return quantum_app
