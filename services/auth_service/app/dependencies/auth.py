"""
Authentication dependencies for the Auth Service.

This module provides dependencies for authentication and authorization.
"""
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from services.auth_service.app.core.config import settings
from services.auth_service.app.db.session import get_db
from services.auth_service.app.repositories.user import get_user_by_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user_id(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> UUID:
    """
    Get the current user ID from the token.
    
    Args:
        token: JWT token.
        db: Database session.
        
    Returns:
        UUID: Current user ID.
        
    Raises:
        HTTPException: If token is invalid or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Get user ID from token
        user_id: Optional[str] = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
        
        # Convert to UUID
        try:
            user_id_uuid = UUID(user_id)
        except ValueError:
            raise credentials_exception
        
    except JWTError:
        raise credentials_exception
    
    # Check if user exists
    user = await get_user_by_id(db, user_id_uuid)
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
    
    return user_id_uuid
