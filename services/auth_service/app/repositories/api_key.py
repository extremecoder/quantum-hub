"""
API key repository for the Auth Service.

This module provides functions for API key-related database operations.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from services.shared.database.models.user import UserApiKey
from services.shared.utils.api_key import generate_api_key, calculate_expiry


async def create_api_key(
    db: AsyncSession,
    user_id: UUID,
    name: str,
    expires_days: Optional[int] = None
) -> UserApiKey:
    """
    Create a new API key.

    Args:
        db: Database session.
        user_id: User ID.
        name: API key name.
        expires_days: Number of days until expiry. If None, no expiry.

    Returns:
        UserApiKey: Created API key.
    """
    # Generate API key
    key = generate_api_key()

    # Calculate expiry date
    expires_at = calculate_expiry(expires_days)

    # Create API key
    api_key = UserApiKey(
        user_id=user_id,
        name=name,
        key=key,
        expires_at=expires_at
    )

    # Add to database
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)

    return api_key


async def get_api_key_by_id(db: AsyncSession, api_key_id: UUID) -> Optional[UserApiKey]:
    """
    Get an API key by ID.

    Args:
        db: Database session.
        api_key_id: API key ID.

    Returns:
        Optional[UserApiKey]: API key if found, None otherwise.
    """
    result = await db.execute(select(UserApiKey).where(UserApiKey.id == api_key_id))
    return result.scalars().first()


async def get_api_key_by_key(db: AsyncSession, key: str) -> Optional[UserApiKey]:
    """
    Get an API key by key.

    Args:
        db: Database session.
        key: API key.

    Returns:
        Optional[UserApiKey]: API key if found, None otherwise.
    """
    result = await db.execute(select(UserApiKey).where(UserApiKey.key == key))
    return result.scalars().first()


async def get_api_keys_by_user_id(db: AsyncSession, user_id: UUID) -> List[UserApiKey]:
    """
    Get all API keys for a user.

    Args:
        db: Database session.
        user_id: User ID.

    Returns:
        List[UserApiKey]: List of API keys.
    """
    result = await db.execute(
        select(UserApiKey)
        .where(UserApiKey.user_id == user_id)
        .order_by(UserApiKey.created_at.desc())
    )
    return result.scalars().all()


async def update_api_key(
    db: AsyncSession,
    api_key_id: UUID,
    name: Optional[str] = None,
    is_active: Optional[bool] = None,
    expires_days: Optional[int] = None
) -> Optional[UserApiKey]:
    """
    Update an API key.

    Args:
        db: Database session.
        api_key_id: API key ID.
        name: API key name.
        is_active: Whether the API key is active.
        expires_days: Number of days until expiry. If None, no change.

    Returns:
        Optional[UserApiKey]: Updated API key if found, None otherwise.
    """
    # Build update values
    values = {}
    if name is not None:
        values["name"] = name
    if is_active is not None:
        values["is_active"] = is_active
    if expires_days is not None:
        values["expires_at"] = calculate_expiry(expires_days)

    if not values:
        # No updates to make
        return await get_api_key_by_id(db, api_key_id)

    # Update API key
    await db.execute(
        update(UserApiKey)
        .where(UserApiKey.id == api_key_id)
        .values(**values)
    )
    await db.commit()

    # Get updated API key
    return await get_api_key_by_id(db, api_key_id)


async def delete_api_key(db: AsyncSession, api_key_id: UUID) -> bool:
    """
    Delete an API key.

    Args:
        db: Database session.
        api_key_id: API key ID.

    Returns:
        bool: True if API key was deleted, False otherwise.
    """
    result = await db.execute(
        delete(UserApiKey)
        .where(UserApiKey.id == api_key_id)
    )
    await db.commit()

    return result.rowcount > 0


async def is_api_key_valid(db: AsyncSession, key: str) -> bool:
    """
    Check if an API key is valid.

    Args:
        db: Database session.
        key: API key.

    Returns:
        bool: True if API key is valid, False otherwise.
    """
    api_key = await get_api_key_by_key(db, key)

    if not api_key:
        return False

    if not api_key.is_active:
        return False

    if api_key.expires_at and api_key.expires_at < datetime.utcnow():
        return False

    return True
