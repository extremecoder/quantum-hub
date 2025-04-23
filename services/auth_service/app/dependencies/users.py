"""
User dependencies for the Auth Service.

This module provides dependency functions for authenticating users
and retrieving the current user from a JWT token.
"""
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from services.auth_service.app.core.config import settings
from services.auth_service.app.core.database import get_db
from services.auth_service.app.core.security import oauth2_scheme
from services.auth_service.app.schemas.token import TokenPayload
from services.auth_service.app.services.user_service import get_user_by_id
from services.shared.database.models import User


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from a JWT token.
    
    Args:
        token: JWT token from Authorization header.
        db: Database session.
        
    Returns:
        User: The authenticated user.
        
    Raises:
        HTTPException: If token is invalid or user is not found.
    """
    try:
        # Decode the token
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        
        # Validate token payload
        token_data = TokenPayload(**payload)
        
        # Ensure token has 'sub' claim (subject)
        if token_data.sub is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database by ID
    user = await get_user_by_id(db, token_data.sub)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to get the current active user.
    
    Args:
        current_user: The authenticated user.
        
    Returns:
        User: The active user.
        
    Raises:
        HTTPException: If user is inactive.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return current_user
