"""
JWT token generation and validation utilities.

This module provides functions for creating and validating JWT tokens
for authentication and authorization purposes.
"""
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

import jwt
from pydantic import ValidationError

# Default configurations
# These should be overridden by environment variables in production
SECRET_KEY = "temporary_secret_key_for_dev_only"  # CHANGE IN PRODUCTION!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes by default


def create_access_token(
    subject: Union[str, Dict[str, Any]],
    expires_delta: Optional[timedelta] = None,
    secret_key: str = SECRET_KEY,
    algorithm: str = ALGORITHM,
    **additional_claims
) -> str:
    """
    Create a JWT access token.
    
    Args:
        subject: The subject of the token, typically user ID or username.
        expires_delta: Optional expiration time delta. Defaults to 30 minutes.
        secret_key: The secret key used for token signing.
        algorithm: The algorithm used for token signing.
        additional_claims: Additional claims to include in the token.
    
    Returns:
        str: The encoded JWT token.
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    expire = datetime.utcnow() + expires_delta
    
    # Create standard claims
    to_encode = {
        "exp": expire,
        "iat": datetime.utcnow(),
        "sub": str(subject) if not isinstance(subject, dict) else None,
        **additional_claims
    }
    
    # If subject is a dict, merge it with to_encode
    if isinstance(subject, dict):
        to_encode.update(subject)
    
    # Remove None values
    to_encode = {k: v for k, v in to_encode.items() if v is not None}
    
    # Create the encoded token
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    
    return encoded_jwt


def decode_token(
    token: str,
    secret_key: str = SECRET_KEY,
    algorithm: str = ALGORITHM,
    verify_exp: bool = True
) -> Dict[str, Any]:
    """
    Decode and validate a JWT token.
    
    Args:
        token: The JWT token to decode.
        secret_key: The secret key used for token validation.
        algorithm: The algorithm used for token validation.
        verify_exp: Whether to verify token expiration.
    
    Returns:
        Dict[str, Any]: The decoded token payload.
        
    Raises:
        jwt.PyJWTError: If token validation fails.
    """
    return jwt.decode(
        token,
        secret_key,
        algorithms=[algorithm],
        options={"verify_exp": verify_exp}
    )


def get_token_subject(token: Dict[str, Any]) -> Optional[str]:
    """
    Extract the subject from a decoded token.
    
    Args:
        token: The decoded token payload.
    
    Returns:
        Optional[str]: The subject claim if present, else None.
    """
    return token.get("sub")
