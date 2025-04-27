"""
User repository for the Auth Service.

This module provides functions for user-related database operations.
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text

from services.shared.database.models.user import User
from services.shared.utils.password import hash_password


async def create_user(
    db: AsyncSession,
    username: str,
    email: str,
    password: str,
    full_name: Optional[str] = None,
    is_active: bool = True,
    is_provider: bool = False,
    roles: List[str] = None
) -> User:
    """
    Create a new user.

    Args:
        db: Database session.
        username: Username.
        email: Email address.
        password: Plain text password.
        full_name: Full name.
        is_active: Whether the user is active.
        is_provider: Whether the user is a provider.
        roles: User roles.

    Returns:
        User: Created user.
    """
    # Hash the password
    hashed_password = hash_password(password)

    # Set default roles if none provided
    if roles is None:
        roles = ["CONSUMER"]

    # Create user
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        is_active=is_active,
        is_provider=is_provider,
        roles=roles
    )

    # Add to database
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """
    Get a user by ID.

    Args:
        db: Database session.
        user_id: User ID.

    Returns:
        Optional[User]: User if found, None otherwise.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """
    Get a user by username.

    Args:
        db: Database session.
        username: Username.

    Returns:
        Optional[User]: User if found, None otherwise.
    """
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Get a user by email.

    Args:
        db: Database session.
        email: Email address.

    Returns:
        Optional[User]: User if found, None otherwise.
    """
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def update_user(
    db: AsyncSession,
    user_id: UUID,
    full_name: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_provider: Optional[bool] = None,
    roles: Optional[List[str]] = None
) -> Optional[User]:
    """
    Update a user.

    Args:
        db: Database session.
        user_id: User ID.
        full_name: Full name.
        is_active: Whether the user is active.
        is_provider: Whether the user is a provider.
        roles: User roles.

    Returns:
        Optional[User]: Updated user if found, None otherwise.
    """
    # Build update values
    values = {}
    if full_name is not None:
        values["full_name"] = full_name
    if is_active is not None:
        values["is_active"] = is_active
    if is_provider is not None:
        values["is_provider"] = is_provider
    if roles is not None:
        values["roles"] = roles

    if not values:
        # No updates to make
        return await get_user_by_id(db, user_id)

    # Update user
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(**values)
    )
    await db.commit()

    # Get updated user
    return await get_user_by_id(db, user_id)


async def update_password(
    db: AsyncSession,
    user_id: UUID,
    password: str
) -> Optional[User]:
    """
    Update a user's password.

    Args:
        db: Database session.
        user_id: User ID.
        password: Plain text password.

    Returns:
        Optional[User]: Updated user if found, None otherwise.
    """
    # Hash the password
    hashed_password = hash_password(password)

    # Update user
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(hashed_password=hashed_password)
    )
    await db.commit()

    # Get updated user
    return await get_user_by_id(db, user_id)


async def delete_user(db: AsyncSession, user_id: UUID) -> bool:
    """
    Delete a user.

    Args:
        db: Database session.
        user_id: User ID.

    Returns:
        bool: True if user was deleted, False otherwise.
    """
    result = await db.execute(
        delete(User)
        .where(User.id == user_id)
    )
    await db.commit()

    return result.rowcount > 0
