"""
API key management endpoints for the Auth Service.

This module provides API endpoints for API key management, including
creating, retrieving, updating, and deleting API keys.
"""
from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from services.auth_service.app.core.database import get_db
from services.auth_service.app.dependencies.users import get_current_active_user
from services.auth_service.app.models.schemas import (
    ApiKeyResponse as ApiKey, ApiKeyCreate, ApiKeyUpdate, ApiKeyWithMaskedKey, ApiUsageStats, UserResponse as User
)
from services.auth_service.app.repositories.api_key import (
    create_api_key, get_api_keys_by_user_id as get_api_keys, get_api_key_by_id as get_api_key,
    update_api_key, delete_api_key
)
from services.shared.utils.api import create_response, raise_http_exception

# Create router
router = APIRouter()


@router.post("", response_model=ApiKey, status_code=status.HTTP_201_CREATED)
async def create_api_key_endpoint(
    key_data: ApiKeyCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Create a new API key.

    Args:
        key_data: API key creation data.
        current_user: Current authenticated user.
        db: Database session dependency.

    Returns:
        ApiKey: The created API key.
    """
    try:
        api_key = await create_api_key(db, current_user.id, key_data)
    except Exception as e:
        raise_http_exception(
            message=f"Failed to create API key: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return create_response(
        data=api_key,
        message="API key created successfully"
    )


@router.get("", response_model=List[ApiKeyWithMaskedKey])
async def get_api_keys_endpoint(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get all API keys for the current user.

    Args:
        current_user: Current authenticated user.
        db: Database session dependency.

    Returns:
        List[ApiKeyWithMaskedKey]: List of API keys with masked key values.
    """
    try:
        api_keys = await get_api_keys(db, current_user.id)

        # Mask key values for security
        masked_keys = []
        for key in api_keys:
            # Create a copy of the key
            key_dict = key.__dict__.copy()

            # Mask the key value
            if key_dict.get("key"):
                original_key = key_dict["key"]
                prefix = original_key.split("_")[0:2]
                prefix_str = "_".join(prefix)
                key_dict["key"] = f"{prefix_str}_{'*' * 12}{original_key[-4:]}"

            masked_keys.append(key_dict)

        return create_response(
            data=masked_keys,
            message="API keys retrieved successfully"
        )
    except Exception as e:
        raise_http_exception(
            message=f"Failed to retrieve API keys: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/{key_id}", response_model=ApiKeyWithMaskedKey)
async def get_api_key_endpoint(
    key_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get a specific API key.

    Args:
        key_id: API key ID.
        current_user: Current authenticated user.
        db: Database session dependency.

    Returns:
        ApiKeyWithMaskedKey: The API key with masked key value.
    """
    api_key = await get_api_key(db, current_user.id, key_id)

    if not api_key:
        raise_http_exception(
            message="API key not found",
            status_code=status.HTTP_404_NOT_FOUND
        )

    # Mask key value for security
    key_dict = api_key.__dict__.copy()
    if key_dict.get("key"):
        original_key = key_dict["key"]
        prefix = original_key.split("_")[0:2]
        prefix_str = "_".join(prefix)
        key_dict["key"] = f"{prefix_str}_{'*' * 12}{original_key[-4:]}"

    return create_response(
        data=key_dict,
        message="API key retrieved successfully"
    )


@router.put("/{key_id}", response_model=ApiKeyWithMaskedKey)
async def update_api_key_endpoint(
    key_id: UUID,
    key_data: ApiKeyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Update an API key.

    Args:
        key_id: API key ID.
        key_data: API key update data.
        current_user: Current authenticated user.
        db: Database session dependency.

    Returns:
        ApiKeyWithMaskedKey: The updated API key with masked key value.
    """
    api_key = await update_api_key(db, current_user.id, key_id, key_data)

    if not api_key:
        raise_http_exception(
            message="API key not found",
            status_code=status.HTTP_404_NOT_FOUND
        )

    # Mask key value for security
    key_dict = api_key.__dict__.copy()
    if key_dict.get("key"):
        original_key = key_dict["key"]
        prefix = original_key.split("_")[0:2]
        prefix_str = "_".join(prefix)
        key_dict["key"] = f"{prefix_str}_{'*' * 12}{original_key[-4:]}"

    return create_response(
        data=key_dict,
        message="API key updated successfully"
    )


@router.delete("/{key_id}")
async def delete_api_key_endpoint(
    key_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Delete an API key.

    Args:
        key_id: API key ID.
        current_user: Current authenticated user.
        db: Database session dependency.

    Returns:
        dict: Success message.
    """
    result = await delete_api_key(db, current_user.id, key_id)

    if not result:
        raise_http_exception(
            message="API key not found",
            status_code=status.HTTP_404_NOT_FOUND
        )

    return create_response(
        data=None,
        message="API key deleted successfully"
    )


@router.get("/usage/stats", response_model=ApiUsageStats)
async def get_api_usage_stats_endpoint(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get API usage statistics for the current user.

    Args:
        current_user: Current authenticated user.
        db: Database session dependency.

    Returns:
        ApiUsageStats: API usage statistics.
    """
    try:
        # Mock implementation for now
        stats = ApiUsageStats(
            total_requests=100,
            total_requests_limit=1000,
            compute_time_hours=2.5,
            compute_time_limit=10.0
        )

        return create_response(
            data=stats,
            message="API usage statistics retrieved successfully"
        )
    except Exception as e:
        raise_http_exception(
            message=f"Failed to retrieve API usage statistics: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
