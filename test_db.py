"""
Script to test the database integration.

This script creates a test user and API key.
"""
import asyncio
import logging
from uuid import UUID

from services.auth_service.app.db.session import AsyncSessionLocal
from services.auth_service.app.repositories.user import create_user
from services.auth_service.app.repositories.api_key import create_api_key

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_test_user() -> UUID:
    """
    Create a test user.

    Returns:
        UUID: User ID.
    """
    import uuid
    import datetime

    # Generate a unique username and email
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    username = f"testuser_{timestamp}"
    email = f"test_{timestamp}@example.com"

    async with AsyncSessionLocal() as db:
        # Create user
        user = await create_user(
            db=db,
            username=username,
            email=email,
            password="password123",
            full_name="Test User",
            is_active=True,
            is_provider=False
        )

        logger.info(f"Created user: {user.username} ({user.id})")

        return user.id


async def create_test_api_key(user_id: UUID) -> None:
    """
    Create a test API key.

    Args:
        user_id: User ID.
    """
    async with AsyncSessionLocal() as db:
        # Create API key
        api_key = await create_api_key(
            db=db,
            user_id=user_id,
            name="Test API Key",
            expires_days=30
        )

        logger.info(f"Created API key: {api_key.name} ({api_key.key})")


async def main() -> None:
    """Run the test."""
    logger.info("Creating test user and API key")

    # Create test user
    user_id = await create_test_user()

    # Create test API key
    await create_test_api_key(user_id)

    logger.info("Test completed")


if __name__ == "__main__":
    asyncio.run(main())
