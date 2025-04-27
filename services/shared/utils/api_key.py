"""
API key generation and validation utilities.

This module provides functions for creating and validating API keys
for authentication and authorization purposes.
"""
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional


def generate_api_key(prefix: str = "qh") -> str:
    """
    Generate a secure API key.
    
    Args:
        prefix: The prefix to use for the API key.
        
    Returns:
        str: The generated API key.
    """
    # Generate a random string of 32 characters
    alphabet = string.ascii_letters + string.digits
    random_part = ''.join(secrets.choice(alphabet) for _ in range(32))
    
    # Format as a Quantum Hub API key
    return f"{prefix}_{random_part}"


def generate_token(length: int = 32) -> str:
    """
    Generate a secure random token.
    
    Args:
        length: The length of the token.
        
    Returns:
        str: The generated token.
    """
    # Generate a random string of specified length
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def calculate_expiry(days: Optional[int] = None) -> Optional[datetime]:
    """
    Calculate an expiry date.
    
    Args:
        days: The number of days until expiry. If None, no expiry.
        
    Returns:
        Optional[datetime]: The expiry date, or None if no expiry.
    """
    if days is None:
        return None
    
    return datetime.utcnow() + timedelta(days=days)
