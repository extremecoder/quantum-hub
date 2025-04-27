"""
Database initialization module for the Auth Service.

This module provides functions to initialize the database with tables and initial data.
"""
import asyncio
import logging
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from services.auth_service.app.core.config import settings
from services.auth_service.app.models.database import Base

# Configure logging
logger = logging.getLogger(__name__)

async def init_db():
    """
    Initialize the database by creating all tables.
    """
    # Create async engine
    db_url = str(settings.DATABASE_URL).replace('postgresql://', 'postgresql+asyncpg://')
    engine = create_async_engine(
        db_url,
        echo=True,
        future=True
    )

    # Create tables
    async with engine.begin() as conn:
        logger.info("Creating database tables...")
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")

    # Close engine
    await engine.dispose()

if __name__ == "__main__":
    # Run the initialization
    asyncio.run(init_db())
