"""
User service for the Auth Service.

This module provides service functions for user-related operations.
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from services.auth_service.app.models.schemas import UserCreate
from services.shared.database.models.user import User
from services.auth_service.app.repositories.user import (
    create_user as repo_create_user,
    get_user_by_email,
    get_user_by_username
)


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """
    Create a new user from UserCreate schema.

    Args:
        db: Database session.
        user_data: User creation data.

    Returns:
        User: Created user.

    Raises:
        HTTPException: If user creation fails.
    """
    # Check if email already exists
    existing_email = await get_user_by_email(db, user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if username already exists
    existing_username = await get_user_by_username(db, user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Create user using repository function
    return await repo_create_user(
        db=db,
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        is_active=user_data.is_active,
        is_provider=user_data.is_provider,
        roles=["CONSUMER"]  # Default role
    )
