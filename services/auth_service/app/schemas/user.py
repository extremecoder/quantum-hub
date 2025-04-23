"""
User-related schemas for the Auth Service.

This module defines Pydantic schemas for request and response
validation related to user management.
"""
from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class UserBase(BaseModel):
    """Base user schema with common attributes."""
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
    """Schema for creating a new user."""
    password: str
    
    @field_validator('password')
    @classmethod
    def password_min_length(cls, v: str) -> str:
        """Validate password meets minimum length."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_provider: Optional[bool] = None


class UserInDBBase(UserBase):
    """Base schema for users in DB."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration."""
        from_attributes = True  # Replaces orm_mode=True in Pydantic v2


class User(UserInDBBase):
    """Schema for returning user information."""
    pass


class UserInDB(UserInDBBase):
    """Schema for user in database, including password hash."""
    hashed_password: str
