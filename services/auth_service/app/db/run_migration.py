#!/usr/bin/env python
"""
Script to run the user migration.

This script runs the migration from the old users table to the shared user table.
"""
import asyncio
import logging
import sys

from migrate_users import main

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

if __name__ == "__main__":
    asyncio.run(main())
