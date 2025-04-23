"""
User service for the Auth Service.

This module provides business logic for user management operations,
including registration, authentication, and profile management.
"""
from typing import List, Optional, Union
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.auth_service.app.core.security import hash_password, verify_password
from services.auth_service.app.schemas.user import UserCreate, UserUpdate
from services.shared.database.models import User


async def get_user_by_id(db: AsyncSession, user_id: Union[str, UUID]) -> Optional[User]:
    """
    Get a user by their ID.
    
    Args:
        db: Database session.
        user_id: User UUID.
        
    Returns:
        Optional[User]: The user if found, else None.
    """
    if isinstance(user_id, str):
        try:
            user_id = UUID(user_id)
        except ValueError:
            return None
            
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalars().first()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """
    Get a user by their username.
    
    Args:
        db: Database session.
        username: Username to look up.
        
    Returns:
        Optional[User]: The user if found, else None.
    """
    result = await db.execute(
        select(User).where(User.username == username)
    )
    return result.scalars().first()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Get a user by their email.
    
    Args:
        db: Database session.
        email: Email to look up.
        
    Returns:
        Optional[User]: The user if found, else None.
    """
    result = await db.execute(
        select(User).where(User.email == email)
    )
    return result.scalars().first()


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """
    Create a new user.
    
    Args:
        db: Database session.
        user_data: User creation data.
        
    Returns:
        User: The created user.
        
    Raises:
        HTTPException: If username or email already exists.
    """
    # Check if username exists
    existing_user = await get_user_by_username(db, user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    existing_email = await get_user_by_email(db, user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create the user
    hashed_password = hash_password(user_data.password)
    
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_active=user_data.is_active,
        is_provider=user_data.is_provider
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


async def authenticate_user(
    db: AsyncSession, username: str, password: str
) -> Optional[User]:
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


async def update_user(
    db: AsyncSession, user: User, user_data: UserUpdate
) -> User:
    """
    Update a user's information.
    
    Args:
        db: Database session.
        user: User to update.
        user_data: User update data.
        
    Returns:
        User: The updated user.
        
    Raises:
        HTTPException: If email already exists.
    """
    # Check if email is being updated and already exists
    if user_data.email and user_data.email != user.email:
        existing_email = await get_user_by_email(db, user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Update user fields
    if user_data.email is not None:
        user.email = user_data.email
    
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    if user_data.is_provider is not None:
        user.is_provider = user_data.is_provider
    
    if user_data.password is not None:
        user.hashed_password = hash_password(user_data.password)
    
    await db.commit()
    await db.refresh(user)
    
    return user
