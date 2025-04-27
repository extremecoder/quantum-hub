"""
Script to initialize the database.

This script creates the database tables and adds initial data.
"""
import asyncio
import logging

from services.auth_service.app.db.init_db import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main() -> None:
    """Initialize the database."""
    logger.info("Initializing database")
    await init_db()
    logger.info("Database initialized")


if __name__ == "__main__":
    asyncio.run(main())
