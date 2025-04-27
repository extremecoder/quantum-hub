"""
Pydantic schemas for the Auth Service.

This module defines Pydantic models for request and response validation.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserBase(BaseModel):
    """Base user schema."""

    username: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_provider: bool = False

    @field_validator('username')
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        """Validate username is alphanumeric and at least 3 characters."""
        if not v.isalnum() or len(v) < 3:
            raise ValueError('Username must be alphanumeric and at least 3 characters')
        return v


class UserCreate(UserBase):
    """User creation schema."""

    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        """Validate password length."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class UserUpdate(BaseModel):
    """User update schema."""

    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_provider: Optional[bool] = None


class UserResponse(UserBase):
    """User response schema."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema."""

    access_token: str
    token_type: str
    refresh_token: Optional[str] = None
    user: UserResponse


class TokenPayload(BaseModel):
    """Schema for token payload data."""

    sub: Optional[str] = None
    exp: Optional[int] = None


class LoginRequest(BaseModel):
    """Login request schema."""

    username: str
    password: str


class MessageResponse(BaseModel):
    """Message response schema."""

    message: str


class ApiKeyBase(BaseModel):
    """Base API key schema."""

    name: str


class ApiKeyCreate(ApiKeyBase):
    """API key creation schema."""

    expires_days: Optional[int] = None


class ApiKeyUpdate(BaseModel):
    """Model for updating an API key."""

    name: Optional[str] = Field(None, description="Name of the API key")
    is_active: Optional[bool] = Field(None, description="Whether the API key is active")
    expires_days: Optional[int] = Field(None, description="Number of days until expiry")


class ApiKeyResponse(ApiKeyBase):
    """API key response schema."""

    id: UUID
    key: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool

    class Config:
        """Pydantic config."""

        from_attributes = True


class ApiKeyWithMaskedKey(ApiKeyBase):
    """Model for API key response with masked key."""

    id: UUID
    key: str  # This will be masked except for newly created keys
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool = True

    class Config:
        """Pydantic config."""

        from_attributes = True


class ApiUsageStats(BaseModel):
    """Model for API usage statistics."""

    total_requests: int
    total_requests_limit: int
    compute_time_hours: float
    compute_time_limit: float
