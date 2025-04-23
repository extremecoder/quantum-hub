"""
Database migrations test script for Quantum Hub.

This script tests the Alembic migrations setup for the Quantum Hub services.
"""
import os
import sys
from sqlalchemy import create_engine, text, inspect

# Set the database connection parameters to use localhost
os.environ["POSTGRES_HOST"] = "localhost"
os.environ["ALEMBIC_CONFIG"] = "./shared/database/migrations/alembic.ini"

# Import required modules
sys.path.append("/Users/atamrak1/dev/rnd/fresh/quantum-hub")
from services.shared.database.db import sync_engine

def test_database_schema():
    """Test that the database schema exists with expected tables."""
    try:
        # Create a connection and inspector
        inspector = inspect(sync_engine)
        
        # Get all table names
        tables = inspector.get_table_names()
        print(f"Found {len(tables)} tables in database")
        
        # Check for expected tables based on TASK_BACKEND.md Task 2
        expected_tables = [
            "user", 
            "user_profile", 
            "user_api_key", 
            "quantum_app", 
            "app_version",
            "project",
            "subscription",
            "marketplace_listing",
            "job",
            "job_result"
        ]
        
        # Convert to lowercase for case-insensitive comparison
        tables_lower = [table.lower() for table in tables]
        
        # Check if expected tables exist
        for table in expected_tables:
            if table in tables_lower:
                print(f"✅ Table '{table}' exists")
            else:
                print(f"❌ Table '{table}' does not exist")
        
        return True
    except Exception as e:
        print(f"Error inspecting database schema: {e}")
        return False

if __name__ == "__main__":
    test_database_schema()
