"""
Test fixtures for the Quantum App Service.

This module provides test fixtures for the Quantum App Service tests.
"""
import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4

from services.quantum_app_service.app.main import app
from services.quantum_app_service.app.core.database import get_db
from services.shared.database.models import Base, User, QuantumApp, AppVersion


# Create test database engine
TEST_SQLALCHEMY_DATABASE_URI = "postgresql+asyncpg://postgres:postgres@localhost/test_quantum_hub"
engine = create_async_engine(TEST_SQLALCHEMY_DATABASE_URI)
TestingSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# Override the get_db dependency
async def override_get_db():
    """Get a test database session."""
    async with TestingSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# Override the get_current_user_id dependency
async def override_get_current_user_id():
    """Get a test user ID."""
    return test_user_id


# Apply overrides
app.dependency_overrides[get_db] = override_get_db


# Test user ID
test_user_id = uuid4()


@pytest_asyncio.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def db_session():
    """Create a test database session."""
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client():
    """Create a test client."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession):
    """Create a test user."""
    # Create user
    user = User(
        id=test_user_id,
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
        is_superuser=False,
        is_verified=True,
        full_name="Test User"
    )
    
    # Save to database
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    # Override the get_current_user_id dependency
    app.dependency_overrides[get_current_user_id] = lambda: user.id
    
    return user


@pytest_asyncio.fixture
async def test_quantum_app(db_session: AsyncSession, test_user: User):
    """Create a test quantum app."""
    # Create quantum app
    quantum_app = QuantumApp(
        developer_id=test_user.id,
        name="Test Quantum App",
        description="A test quantum app",
        type="CIRCUIT",
        status=["DRAFT"],
        visibility="PRIVATE"
    )
    
    # Save to database
    db_session.add(quantum_app)
    await db_session.commit()
    await db_session.refresh(quantum_app)
    
    # Create app version
    app_version = AppVersion(
        quantum_app_id=quantum_app.id,
        version_number="1.0.0",
        sdk_used="QISKIT",
        is_latest=True,
        status="DRAFT"
    )
    
    # Save to database
    db_session.add(app_version)
    await db_session.commit()
    await db_session.refresh(app_version)
    
    # Update quantum app with latest version
    quantum_app.latest_version_id = app_version.id
    await db_session.commit()
    await db_session.refresh(quantum_app)
    
    return quantum_app
