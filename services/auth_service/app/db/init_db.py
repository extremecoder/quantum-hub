"""
Database initialization for the Auth Service.

This module provides functions for initializing the database.
"""
import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.sql import text

from services.auth_service.app.db.session import engine
from services.auth_service.app.models.database import Base

logger = logging.getLogger(__name__)


async def create_tables(engine: AsyncEngine) -> None:
    """
    Create database tables.
    
    Args:
        engine: Database engine.
    """
    async with engine.begin() as conn:
        # Drop all tables if they exist
        # await conn.run_sync(Base.metadata.drop_all)
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database tables created")


async def check_connection() -> bool:
    """
    Check database connection.
    
    Returns:
        bool: True if connection is successful, False otherwise.
    """
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


async def init_db() -> None:
    """Initialize the database."""
    if await check_connection():
        await create_tables(engine)
    else:
        logger.error("Database initialization failed")


if __name__ == "__main__":
    asyncio.run(init_db())
