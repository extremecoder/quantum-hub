"""
Database connection and session management for the Auth Service.

This module provides utilities for connecting to the database,
creating sessions, and accessing the database in a dependency-injection pattern.
"""
from typing import AsyncGenerator, Generator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from services.auth_service.app.core.config import settings

# Use a default SQLite connection for testing if DATABASE_URL is not set
DEFAULT_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Convert Pydantic PostgreSQL URL to asyncpg for async SQLAlchemy
if settings.DATABASE_URL:
    database_url = str(settings.DATABASE_URL)
    if 'postgresql://' in database_url:
        database_url = database_url.replace('postgresql://', 'postgresql+asyncpg://')
else:
    database_url = DEFAULT_DATABASE_URL

# Create async database engine
engine = create_async_engine(
    database_url,
    echo=False,
    future=True,
    pool_pre_ping=True
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autocommit=False, 
    autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for getting a database session.
    
    Yields an async SQLAlchemy session and ensures it is closed
    after the request is complete.
    
    Yields:
        AsyncSession: SQLAlchemy async session for database operations.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
