"""
Authentication endpoints for the Auth Service.

This module provides API endpoints for user authentication, including
login, registration, token refresh, and social authentication.
"""
from datetime import timedelta
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from services.auth_service.app.core.config import settings
from services.auth_service.app.core.database import get_db
from services.auth_service.app.core.security import create_access_token
from services.auth_service.app.dependencies.users import get_current_user
from services.auth_service.app.schemas.token import Token
from services.auth_service.app.schemas.user import User, UserCreate
from services.auth_service.app.services.user_service import authenticate_user, create_user
from services.shared.utils.api import create_response, raise_http_exception

# Create router
router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Register a new user.
    
    Args:
        user_data: User creation data.
        db: Database session dependency.
    
    Returns:
        Token: Access token for the new user.
        
    Raises:
        HTTPException: If registration fails.
    """
    # Create the user
    try:
        user = await create_user(db, user_data)
    except HTTPException as e:
        # Re-raise with standard format
        raise_http_exception(
            message=e.detail,
            status_code=e.status_code
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Create token with user ID as subject
    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=access_token_expires,
        additional_claims={"username": user.username}
    )
    
    # Return token response
    return create_response(
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        },
        message="User registered successfully"
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Authenticate and login a user.
    
    Args:
        form_data: OAuth2 form with username and password.
        db: Database session dependency.
    
    Returns:
        Token: Access token for the authenticated user.
        
    Raises:
        HTTPException: If authentication fails.
    """
    # Authenticate user
    user = await authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise_http_exception(
            message="Incorrect username or password",
            status_code=status.HTTP_401_UNAUTHORIZED,
            error="invalid_credentials"
        )
    
    # Check if user is active
    if not user.is_active:
        raise_http_exception(
            message="Inactive user",
            status_code=status.HTTP_400_BAD_REQUEST,
            error="inactive_user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Create token with user ID as subject
    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=access_token_expires,
        additional_claims={"username": user.username}
    )
    
    # Return token response
    return create_response(
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        },
        message="Login successful"
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Refresh access token.
    
    Args:
        current_user: Current authenticated user.
    
    Returns:
        Token: New access token.
    """
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Create token with user ID as subject
    access_token = create_access_token(
        subject=str(current_user.id),
        expires_delta=access_token_expires,
        additional_claims={"username": current_user.username}
    )
    
    # Return token response
    return create_response(
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "user": current_user
        },
        message="Token refreshed successfully"
    )


@router.post("/google", response_model=Token)
async def google_login() -> Any:
    """
    Initialize Google OAuth login flow.
    
    Returns:
        dict: Google OAuth URL to redirect user to.
    """
    # In a real implementation, this would generate a redirect URL to Google's OAuth page
    # For now, return a placeholder
    return create_response(
        data={
            "redirect_url": f"https://accounts.google.com/o/oauth2/auth?client_id={settings.GOOGLE_CLIENT_ID}"
        },
        message="Google OAuth flow initialized"
    )


@router.get("/google/callback", response_model=Token)
async def google_callback(
    code: str,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Handle Google OAuth callback and authenticate user.
    
    Args:
        code: Authorization code from Google.
        db: Database session dependency.
        
    Returns:
        Token: Access token for the authenticated user.
    """
    # In a real implementation, this would:
    # 1. Exchange the code for an access token with Google
    # 2. Get user info from Google
    # 3. Find or create the user in our database
    # 4. Create and return a token
    
    # For now, just return a placeholder response
    return create_response(
        data={
            "access_token": "placeholder_token",
            "token_type": "bearer",
            "user": {
                "id": "placeholder_id",
                "username": "google_user",
                "email": "google_user@example.com",
                "full_name": "Google User"
            }
        },
        message="Google authentication successful"
    )
