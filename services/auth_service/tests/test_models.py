"""
Test-specific models for SQLite compatibility.

This module provides versions of the database models that are compatible
with SQLite for testing purposes.
"""
from datetime import datetime
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, MetaData, String, Text, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

# Create a separate MetaData instance for test models
test_metadata = MetaData()
TestBase = declarative_base(metadata=test_metadata)


class BaseModel:
    """Base model with common columns for all test models."""
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class User(TestBase, BaseModel):
    """
    User model for testing with SQLite.
    
    This is a simplified version of the User model that is compatible
    with SQLite for testing purposes.
    """
    __tablename__ = "test_user"
    
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    # Using String instead of ARRAY for SQLite compatibility
    roles = Column(String(255), nullable=False, default="CONSUMER")
    is_active = Column(Boolean, default=True)
    is_provider = Column(Boolean, default=False)
    last_login = Column(DateTime(timezone=True), nullable=True)


class UserProfile(TestBase, BaseModel):
    """
    User profile model for testing with SQLite.
    """
    __tablename__ = "test_user_profile"
    
    user_id = Column(
        String(36), 
        ForeignKey("test_user.id", ondelete="CASCADE"), 
        unique=True, 
        nullable=False
    )
    organization = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    # Using Text instead of JSONB for SQLite compatibility
    contact_info = Column(Text, nullable=True)
    social_links = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", backref="profile", uselist=False)


class UserApiKey(TestBase, BaseModel):
    """
    User API key model for testing with SQLite.
    """
    __tablename__ = "test_user_api_key"
    
    user_id = Column(
        String(36), 
        ForeignKey("test_user.id", ondelete="CASCADE"), 
        nullable=False
    )
    name = Column(String(100), nullable=False)
    value = Column(String(255), unique=True, nullable=False, index=True)
    status = Column(
        String(20), 
        default="active", 
        nullable=False
    )
    rate_limit = Column(String(50), nullable=True)
    expire_at = Column(DateTime(timezone=True), nullable=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", backref="api_keys")


class UserSession(TestBase, BaseModel):
    """
    User session model for testing with SQLite.
    """
    __tablename__ = "test_user_session"
    
    user_id = Column(
        String(36), 
        ForeignKey("test_user.id", ondelete="CASCADE"), 
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
