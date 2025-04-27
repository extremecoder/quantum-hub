"""
Database session management for the Auth Service.

This module provides functions for creating and managing database sessions.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from services.auth_service.app.core.config import settings

# Create async engine
engine = create_async_engine(
    str(settings.DATABASE_URL),
    echo=True,
    future=True,
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """
    Get a database session.

    Yields:
        AsyncSession: Database session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
