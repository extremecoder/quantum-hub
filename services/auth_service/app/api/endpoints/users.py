"""
User management endpoints for the Auth Service.

This module provides API endpoints for user management, including
retrieving, updating, and deleting users.
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from services.auth_service.app.core.database import get_db
from services.auth_service.app.dependencies.users import get_current_active_user, get_current_user
from services.auth_service.app.models.schemas import UserResponse as User, UserUpdate
from services.auth_service.app.repositories.user import update_user
from services.shared.utils.api import create_response, raise_http_exception

# Create router
router = APIRouter()


@router.get("/me", response_model=User)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get current user profile.

    Args:
        current_user: Current authenticated user.

    Returns:
        User: Current user data.
    """
    return current_user


@router.put("/me", response_model=User)
async def update_user_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Update current user information.

    Args:
        user_data: User update data.
        current_user: Current authenticated user.
        db: Database session dependency.

    Returns:
        User: Updated user data.
    """
    try:
        updated_user = await update_user(db, current_user.id,
                                      full_name=user_data.full_name,
                                      is_active=user_data.is_active,
                                      is_provider=user_data.is_provider)
    except HTTPException as e:
        # Re-raise with standard format
        raise_http_exception(
            message=e.detail,
            status_code=e.status_code
        )

    return updated_user
