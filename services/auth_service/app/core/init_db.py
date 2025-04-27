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
from services.shared.database.base import Base

# Import models to register them with SQLAlchemy
# These imports are needed even if they're not directly used
# noqa: F401 - imports are used for SQLAlchemy model registration
from services.auth_service.app.models.database import RefreshToken, PasswordReset, EmailVerification  # noqa: F401
from services.shared.database.models.user import User, UserApiKey, UserProfile, UserSession  # noqa: F401

# Do not import other models to avoid circular dependencies
# The Auth Service only needs the user-related models

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
