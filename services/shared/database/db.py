"""
Database connection management module.

This module provides centralized database connection management for all services
using SQLAlchemy 2.0 with SQLModel.
"""
from typing import AsyncGenerator, Generator
from contextlib import contextmanager
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import Session, sessionmaker
from urllib.parse import quote_plus

# Database configuration
DB_USER = os.getenv("POSTGRES_USER", "quantum_user")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "quantum_password")
DB_HOST = os.getenv("POSTGRES_HOST", "postgres")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "quantum_hub")

# Create connection strings
SYNC_DB_URL = f"postgresql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
ASYNC_DB_URL = f"postgresql+asyncpg://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create engines
sync_engine = create_engine(SYNC_DB_URL, echo=False, pool_pre_ping=True)
async_engine = create_async_engine(ASYNC_DB_URL, echo=False, pool_pre_ping=True)

# Create session factories
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)
AsyncSessionLocal = sessionmaker(
    class_=AsyncSession, autocommit=False, autoflush=False, bind=async_engine
)


@contextmanager
def get_db() -> Generator[Session, None, None]:
    """
    Synchronous database session context manager.
    
    Returns:
        Generator[Session, None, None]: A SQLAlchemy session.
    
    Yields:
        Session: A SQLAlchemy session for database operations.
    """
    db = SyncSessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Asynchronous database session context manager.
    
    Returns:
        AsyncGenerator[AsyncSession, None]: An async SQLAlchemy session.
    
    Yields:
        AsyncSession: An async SQLAlchemy session for database operations.
    """
    async_session = AsyncSessionLocal()
    try:
        yield async_session
        await async_session.commit()
    except Exception:
        await async_session.rollback()
        raise
    finally:
        await async_session.close()
