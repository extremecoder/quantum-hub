"""
Database connection for the Project Service.

This module provides database connection utilities for the Project Service,
including session management and dependency injection.
"""
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from services.shared.database.db import async_session_maker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Get a database session.
    
    Yields:
        AsyncSession: Database session.
    """
    async with async_session_maker() as session:
        yield session
