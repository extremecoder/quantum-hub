"""
Security utilities for the Project Service.

This module provides JWT token handling and user authentication functionality.
"""
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status, Header
from jose import jwt, JWTError

from services.project_service.app.core.config import settings


async def get_current_user_id(
    authorization: Optional[str] = Header(None)
) -> UUID:
    """
    Get the current user ID from the JWT token.
    
    Args:
        authorization: Authorization header.
        
    Returns:
        UUID: User ID.
        
    Raises:
        HTTPException: If token is invalid or missing.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Extract token from header
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Decode token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Get user ID from token
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return UUID(user_id)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
