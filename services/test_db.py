"""
Database connection test script for Quantum Hub.

This script tests the connection to the PostgreSQL database used by the Quantum Hub services.
"""
import os
import sys
from sqlalchemy import create_engine, text

# Set the database connection parameters to use localhost
os.environ["POSTGRES_HOST"] = "localhost"

# Import our database module
sys.path.append("/Users/atamrak1/dev/rnd/fresh/quantum-hub")
from services.shared.database.db import sync_engine

def test_database_connection():
    """Test the database connection."""
    try:
        # Create a connection
        with sync_engine.connect() as conn:
            # Execute a simple query
            result = conn.execute(text("SELECT 1")).scalar()
            print(f"Database connection result: {result}")
            print("Database connection successful")
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

if __name__ == "__main__":
    test_database_connection()
