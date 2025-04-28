#!/usr/bin/env python
"""
Test script for URL fields in database models.

This script tests that URL fields can store long strings correctly.
"""
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone

# Add the parent directory to sys.path
parent_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(parent_dir)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use relative imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from database.models.user import User, UserApiKey
from database.models.execution import Platform

# Database configuration
DB_USER = os.getenv("POSTGRES_USER", "quantum_user")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "quantum_password")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "quantum_hub")
DB_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create engine and session
engine = create_engine(DB_URL)
Session = sessionmaker(bind=engine)

def test_long_url_fields():
    """Test that URL fields can store long strings correctly."""
    session = Session()

    try:
        # Create a test user
        test_user = User(
            id=uuid.uuid4(),
            username=f"test_user_{uuid.uuid4().hex[:8]}",
            email=f"test_{uuid.uuid4().hex[:8]}@example.com",
            hashed_password="hashed_password",
            roles=["CONSUMER"]
        )
        session.add(test_user)
        session.flush()

        # Create a UserApiKey with a long value
        long_api_key = "x" * 500  # 500 characters
        api_key = UserApiKey(
            id=uuid.uuid4(),
            user_id=test_user.id,
            name="Test API Key",
            value=long_api_key,
            status="active",
            expire_at=datetime.now(timezone.utc) + timedelta(days=30)
        )
        session.add(api_key)

        # Create a Platform with a long API endpoint
        long_url = "https://example.com/" + "x" * 500  # URL with 500+ characters
        platform = Platform(
            id=uuid.uuid4(),
            name="Test Platform",
            provider="Test Provider",
            api_endpoint=long_url
        )
        session.add(platform)

        # Commit the changes
        session.commit()

        # Retrieve the objects to verify they were stored correctly
        retrieved_api_key = session.query(UserApiKey).filter_by(id=api_key.id).first()
        retrieved_platform = session.query(Platform).filter_by(id=platform.id).first()

        # Verify the values
        assert retrieved_api_key.value == long_api_key, "API key value was not stored correctly"
        assert retrieved_platform.api_endpoint == long_url, "Platform API endpoint was not stored correctly"

        print("✅ Test passed: Long URL fields were stored and retrieved correctly")
        return True

    except Exception as e:
        print(f"❌ Test failed: {e}")
        session.rollback()
        return False

    finally:
        # Clean up
        try:
            session.query(UserApiKey).filter_by(id=api_key.id).delete()
            session.query(Platform).filter_by(id=platform.id).delete()
            session.query(User).filter_by(id=test_user.id).delete()
            session.commit()
        except:
            session.rollback()

        session.close()

if __name__ == "__main__":
    success = test_long_url_fields()
    sys.exit(0 if success else 1)
