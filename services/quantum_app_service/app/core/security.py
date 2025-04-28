"""
Security utilities for the Quantum App Service.

This module provides functions for authentication and authorization.
"""
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from services.shared.utils.jwt import decode_token, get_token_subject
from services.quantum_app_service.app.core.config import settings

# Create security scheme
security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UUID:
    """
    Get the current user ID from the JWT token.

    Args:
        credentials: HTTP authorization credentials.

    Returns:
        UUID: Current user ID.

    Raises:
        HTTPException: If the token is invalid or expired.
    """
    try:
        # Decode token
        token = credentials.credentials

        # Try with JWT_SECRET_KEY first
        try:
            payload = decode_token(token, secret_key=settings.JWT_SECRET_KEY)
        except Exception:
            # Fall back to SECRET_KEY if available
            if hasattr(settings, 'SECRET_KEY'):
                payload = decode_token(token, secret_key=settings.SECRET_KEY)
            else:
                # Re-raise the original exception if SECRET_KEY is not available
                raise

        # Get user ID from token
        user_id = get_token_subject(payload)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return UUID(user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
