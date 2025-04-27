"""
Authentication endpoints for the Auth Service.

This module provides API endpoints for user authentication, including
login, registration, token refresh, logout, password reset, email verification,
and social authentication.
"""
import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import EmailStr

from services.auth_service.app.core.config import settings
from services.auth_service.app.core.database import get_db
from services.auth_service.app.core.security import create_access_token
from services.auth_service.app.dependencies.users import get_current_user
from services.auth_service.app.models.schemas import TokenResponse, UserCreate, UserResponse
from services.auth_service.app.models.database import User
from services.auth_service.app.repositories.user import (
    create_user, get_user_by_email, get_user_by_username, update_user
)
from services.shared.utils.password import verify_password
from services.shared.utils.api import create_response, raise_http_exception

# Helper function for authentication
async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[User]:
    """
    Authenticate a user with username and password.

    Args:
        db: Database session.
        username: Username to authenticate.
        password: Password to verify.

    Returns:
        Optional[User]: The authenticated user if successful, else None.
    """
    user = await get_user_by_username(db, username)

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user

# Create router
router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
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


@router.post("/login", response_model=TokenResponse)
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


@router.post("/refresh", response_model=TokenResponse)
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


@router.post("/google", response_model=TokenResponse)
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


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Logout a user by invalidating their current session.

    In a complete implementation, this would:
    1. Add the current token to a blacklist
    2. Update the user's session record

    Args:
        current_user: Current authenticated user.
        db: Database session dependency.

    Returns:
        dict: Success message.
    """
    # In a real implementation, we would invalidate the token
    # For now, just return a success message

    # TODO: Implement token blacklisting
    # 1. Get token from authorization header
    # 2. Add to blacklist with expiration time
    # 3. Update user session record

    return create_response(
        data=None,
        message="Successfully logged out"
    )


@router.post("/reset-password")
async def request_password_reset(
    email: EmailStr = Body(...),
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Request a password reset.

    Args:
        email: User's email address.
        background_tasks: Background tasks runner.
        db: Database session dependency.

    Returns:
        dict: Success message.
    """
    # Find user by email
    user = await get_user_by_email(db, email)

    # Always return success to prevent email enumeration
    if not user:
        return create_response(
            data=None,
            message="If your email is registered, you will receive a password reset link"
        )

    # Generate reset token
    reset_token = secrets.token_urlsafe(32)

    # In a real implementation, we would:
    # 1. Store the token in the database with expiration
    # 2. Send an email with the reset link

    # TODO: Store token in database
    # TODO: Implement email sending
    # background_tasks.add_task(
    #     send_password_reset_email,
    #     email=user.email,
    #     token=reset_token
    # )

    # For development, return the token directly
    if settings.ENVIRONMENT == "development":
        return create_response(
            data={"reset_token": reset_token},
            message="Password reset requested. In production, an email would be sent."
        )

    return create_response(
        data=None,
        message="If your email is registered, you will receive a password reset link"
    )


@router.post("/reset-password/{token}")
async def reset_password(
    token: str,
    new_password: str = Body(...),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Reset a user's password using a reset token.

    Args:
        token: Password reset token.
        new_password: New password.
        db: Database session dependency.

    Returns:
        dict: Success message.
    """
    # In a real implementation, we would:
    # 1. Validate the token from the database
    # 2. Check if it's expired
    # 3. Find the associated user

    # For now, return a placeholder response
    # TODO: Implement actual password reset

    return create_response(
        data=None,
        message="Password has been reset successfully"
    )


@router.get("/verify/{token}")
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Verify a user's email address using a verification token.

    Args:
        token: Email verification token.
        db: Database session dependency.

    Returns:
        dict: Success message.
    """
    # In a real implementation, we would:
    # 1. Validate the token from the database
    # 2. Check if it's expired
    # 3. Find the associated user
    # 4. Mark the user's email as verified

    # For now, return a placeholder response
    # TODO: Implement actual email verification

    return create_response(
        data=None,
        message="Email verified successfully"
    )


@router.get("/google/callback", response_model=TokenResponse)
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
