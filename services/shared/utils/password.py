"""
Password hashing and verification utilities.

This module provides functions for securely hashing and verifying passwords
using Passlib with Bcrypt.
"""
from passlib.context import CryptContext

# Configure the password context with bcrypt
# Using bcrypt for strong password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Configurable work factor
)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: The plaintext password to hash.
        
    Returns:
        str: The hashed password string.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: The plaintext password to verify.
        hashed_password: The hashed password to compare against.
        
    Returns:
        bool: True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)
