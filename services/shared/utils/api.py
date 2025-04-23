"""
API response models and error handling utilities.

This module provides standardized response models and error handling
functions for consistent API responses across services.
"""
from typing import Any, Dict, Generic, List, Optional, TypeVar, Union
from fastapi import HTTPException, status
from pydantic import BaseModel, Field

# Type variable for generic response models
T = TypeVar('T')


class ErrorResponse(BaseModel):
    """Error response model with detailed information."""
    
    status_code: int = Field(..., description="HTTP status code")
    error: str = Field(..., description="Error type identifier")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


class PaginationMeta(BaseModel):
    """Pagination metadata for paginated responses."""
    
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    total_items: int = Field(..., description="Total number of items")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there is a next page")
    has_prev: bool = Field(..., description="Whether there is a previous page")


class BaseResponse(BaseModel, Generic[T]):
    """Base response model for all API responses."""
    
    success: bool = Field(..., description="Whether the request was successful")
    message: Optional[str] = Field(None, description="Response message")
    data: Optional[T] = Field(None, description="Response data")
    errors: Optional[List[ErrorResponse]] = Field(None, description="List of errors")
    meta: Optional[Dict[str, Any]] = Field(None, description="Response metadata")


class PaginatedResponse(BaseResponse[List[T]]):
    """Paginated response model with pagination metadata."""
    
    pagination: Optional[PaginationMeta] = Field(None, description="Pagination metadata")


def create_response(
    data: Optional[Any] = None,
    message: Optional[str] = None,
    meta: Optional[Dict[str, Any]] = None,
    success: bool = True
) -> Dict[str, Any]:
    """
    Create a standardized successful response.
    
    Args:
        data: The response data.
        message: A message to include in the response.
        meta: Additional metadata to include.
        success: Whether the request was successful.
        
    Returns:
        Dict[str, Any]: A standardized response dictionary.
    """
    response = {
        "success": success,
        "message": message,
        "data": data,
        "errors": None,
        "meta": meta
    }
    
    # Remove None values
    return {k: v for k, v in response.items() if v is not None}


def create_error_response(
    message: str,
    status_code: int = status.HTTP_400_BAD_REQUEST,
    error: str = "bad_request",
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create a standardized error response.
    
    Args:
        message: Human-readable error message.
        status_code: HTTP status code.
        error: Error type identifier.
        details: Additional error details.
        
    Returns:
        Dict[str, Any]: A standardized error response dictionary.
    """
    error_obj = {
        "status_code": status_code,
        "error": error,
        "message": message,
        "details": details
    }
    
    # Remove None values from error object
    error_obj = {k: v for k, v in error_obj.items() if v is not None}
    
    return {
        "success": False,
        "errors": [error_obj],
        "data": None
    }


def raise_http_exception(
    message: str,
    status_code: int = status.HTTP_400_BAD_REQUEST,
    error: str = "bad_request",
    details: Optional[Dict[str, Any]] = None
) -> None:
    """
    Raise an HTTPException with a standardized error response.
    
    Args:
        message: Human-readable error message.
        status_code: HTTP status code.
        error: Error type identifier.
        details: Additional error details.
        
    Raises:
        HTTPException: With the specified status code and error content.
    """
    error_content = create_error_response(
        message=message,
        status_code=status_code,
        error=error,
        details=details
    )
    
    raise HTTPException(
        status_code=status_code,
        detail=error_content["errors"][0]
    )
