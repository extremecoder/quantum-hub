"""
User-related database models.

This module contains all SQLAlchemy models related to user management,
including authentication, profiles, and API keys.
"""
from datetime import datetime
from typing import List, Optional
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import relationship

from ..base import Base, BaseModel
from ..enums import ApiKeyStatus


class User(Base, BaseModel):
    """
    User model representing registered users of the Quantum Hub.
    
    This table stores essential user information including authentication
    details, roles, and account status.
    """
    
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    roles = Column(ARRAY(String), nullable=False, default=["CONSUMER"])
    is_active = Column(Boolean, default=True)
    is_provider = Column(Boolean, default=False)
    last_login = Column(DateTime(timezone=True), nullable=True)


class UserProfile(Base, BaseModel):
    """
    User profile model containing additional user information.
    
    This table stores user profile data such as biography, avatar, 
    organization, and contact details.
    """
    
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("user.id", ondelete="CASCADE"), 
        unique=True, 
        nullable=False
    )
    organization = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    contact_info = Column(JSONB, nullable=True)
    social_links = Column(JSONB, nullable=True)
    
    # Relationships
    user = relationship("User", backref="profile", uselist=False)


class UserApiKey(Base, BaseModel):
    """
    User API key model for API access authentication.
    
    This table stores API keys generated for users to authenticate
    with the Quantum Hub API programmatically.
    """
    
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("user.id", ondelete="CASCADE"), 
        nullable=False
    )
    name = Column(String(100), nullable=False)
    value = Column(String(255), unique=True, nullable=False, index=True)
    status = Column(
        String(20), 
        default=ApiKeyStatus.ACTIVE.value, 
        nullable=False
    )
    rate_limit = Column(String(50), nullable=True)
    expire_at = Column(DateTime(timezone=True), nullable=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", backref="api_keys")


class UserSession(Base, BaseModel):
    """
    User session model for tracking user login sessions.
    
    This table stores information about user sessions including
    tokens, expiration, and device information.
    """
    
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("user.id", ondelete="CASCADE"), 
        nullable=False
    )
    token = Column(String(255), unique=True, nullable=False)
    issued_at = Column(
        DateTime(timezone=True), 
        nullable=False, 
        default=datetime.utcnow
    )
    expires_at = Column(DateTime(timezone=True), nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", backref="sessions")
