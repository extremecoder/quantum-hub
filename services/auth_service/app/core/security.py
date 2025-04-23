"""
Security utilities for the Auth Service.

This module provides JWT token handling and password hashing functionality.
It wraps and extends the shared utils implementations with service-specific logic.
"""
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from jose.exceptions import JWTError

from services.shared.utils.password import hash_password, verify_password
from services.shared.utils.jwt import create_access_token as shared_create_token
from services.auth_service.app.core.config import settings

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def create_access_token(
    subject: Union[str, Dict[str, Any]],
    expires_delta: Optional[timedelta] = None,
    additional_claims: Optional[Dict[str, Any]] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        subject: The subject of the token, typically user ID or dict of data.
        expires_delta: Optional expiration time delta. Defaults to settings.
        additional_claims: Additional claims to include in the token.
    
    Returns:
        str: The encoded JWT token.
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    claims = additional_claims or {}
    
    return shared_create_token(
        subject=subject,
        expires_delta=expires_delta,
        secret_key=settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
        **claims
    )


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT token.
    
    Args:
        token: The JWT token to decode.
    
    Returns:
        Dict[str, Any]: The decoded token payload.
        
    Raises:
        HTTPException: If token validation fails.
    """
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


__all__ = [
    "oauth2_scheme",
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token"
]
