"""
Initialize the test database for the Auth Service.

This script creates a test database and initializes it with the necessary tables.
"""
import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.sql import text

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from services.auth_service.app.models.database import Base


# Database URL for the test database
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/quantum_hub_test"
)

# Create the test database
async def create_test_database():
    """Create the test database."""
    # Connect to the default database to create the test database
    default_engine = create_async_engine(
        "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres",
        isolation_level="AUTOCOMMIT"
    )

    async with default_engine.begin() as conn:
        # Check if the test database exists
        result = await conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = 'quantum_hub_test'")
        )
        if result.scalar() is None:
            # Create the test database
            await conn.execute(text("CREATE DATABASE quantum_hub_test"))
            print("Test database created.")
        else:
            print("Test database already exists.")

    await default_engine.dispose()


# Initialize the test database with tables
async def init_test_database():
    """Initialize the test database with tables."""
    # Create engine for the test database
    engine = create_async_engine(TEST_DATABASE_URL)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()

    print("Test database initialized with tables.")


async def main():
    """Main function."""
    await create_test_database()
    await init_test_database()


if __name__ == "__main__":
    asyncio.run(main())
