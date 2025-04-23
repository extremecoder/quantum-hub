"""
Token-related schemas for the Auth Service.

This module defines Pydantic schemas for authentication tokens
and related request/response models.
"""
from typing import Annotated, Optional

from pydantic import BaseModel, Field

from services.auth_service.app.schemas.user import User


class Token(BaseModel):
    """Schema for access token response."""
    access_token: str
    token_type: str = "bearer"
    user: Optional[User] = None


class TokenPayload(BaseModel):
    """Schema for token payload data."""
    sub: Optional[str] = None
    exp: Optional[int] = None
