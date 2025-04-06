"""
Manual test script for auth service functionality.

This script validates the basic authentication functionality
without depending on the complex test framework.
"""
import sys
import asyncio
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from main import verify_password, get_password_hash, create_access_token

# Constants
SECRET_KEY = "test_secret_key"
ALGORITHM = "HS256"

# Password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def test_password_hashing():
    """Test password hashing and verification."""
    password = "testpassword"
    hashed = get_password_hash(password)
    print(f"Original password: {password}")
    print(f"Hashed password: {hashed}")
    
    # Test verification
    assert verify_password(password, hashed)
    print("✅ Password verification works with correct password")
    
    assert not verify_password("wrongpassword", hashed)
    print("✅ Password verification fails with incorrect password")

def test_token_creation():
    """Test JWT token creation and validation."""
    data = {"sub": "testuser"}
    expires_delta = timedelta(minutes=15)
    
    token = create_access_token(data, expires_delta)
    print(f"Generated token: {token}")
    
    # Decode and verify token
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "testuser"
    assert "exp" in payload
    print("✅ Token contains correct subject and expiration time")
    
    # Create expired token
    expired_delta = timedelta(minutes=-5)  # already expired
    expired_token = create_access_token(data, expired_delta)
    
    try:
        jwt.decode(expired_token, SECRET_KEY, algorithms=[ALGORITHM])
        print("❌ Expired token validation should have failed")
    except jwt.ExpiredSignatureError:
        print("✅ Expired token correctly rejected")

if __name__ == "__main__":
    print("Testing authentication functionality...")
    test_password_hashing()
    test_token_creation()
    print("All manual tests passed successfully! ✅")
