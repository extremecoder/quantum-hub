"""
Marketplace-related database models.

This module contains all SQLAlchemy models related to the marketplace,
including listings, subscriptions, and subscription keys.
"""
from datetime import datetime
from typing import List, Optional
import uuid

from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, Numeric, String, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..base import Base, BaseModel
from ..enums import (
    ApiKeyStatus, MarketplaceListingStatus, SubscriptionStatus, SubscriptionType
)


class MarketplaceListing(Base, BaseModel):
    """
    Marketplace Listing model for commercial quantum applications.

    This table stores information about quantum applications listed for
    purchase in the marketplace, including pricing and support details.
    """

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quantum_app_id = Column(
        UUID(as_uuid=True),
        ForeignKey("quantum_app.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    listed_by = Column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False
    )
    price = Column(
        Numeric(precision=10, scale=2),
        nullable=False
    )
    currency = Column(String(3), default="USD", nullable=False)
    status = Column(
        String(20),
        default=MarketplaceListingStatus.ACTIVE.value
    )
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    preview_enabled = Column(Boolean, default=False)
    support_email = Column(String(100), nullable=True)
    support_url = Column(String(255), nullable=True)

    # Relationships
    lister = relationship("User", backref="marketplace_listings")
    quantum_app = relationship("QuantumApp", back_populates="marketplace_listing")
    # Remove backref to avoid circular dependency with Subscription
    subscriptions = relationship("Subscription", back_populates="marketplace_listing")


class Subscription(Base, BaseModel):
    """
    Subscription model for user subscriptions to marketplace applications.

    This table stores information about user subscriptions to commercial
    quantum applications, including subscription type, duration, and status.
    """

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False
    )
    quantum_app_id = Column(
        UUID(as_uuid=True),
        ForeignKey("quantum_app.id", ondelete="CASCADE"),
        nullable=False
    )
    marketplace_listing_id = Column(
        UUID(as_uuid=True),
        ForeignKey("marketplace_listing.id", ondelete="CASCADE"),
        nullable=False
    )
    subscription_type = Column(
        String(20),
        nullable=False
    )
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(
        String(20),
        default=SubscriptionStatus.ACTIVE.value
    )
    service_uri = Column(String(255), nullable=True)
    rate = Column(
        Numeric(precision=10, scale=2),
        nullable=True
    )

    # Relationships
    user = relationship("User", backref="subscriptions")
    quantum_app = relationship("QuantumApp")
    marketplace_listing = relationship("MarketplaceListing", back_populates="subscriptions")
    # Remove backref to avoid circular dependency with SubscriptionKey
    subscription_keys = relationship("SubscriptionKey", back_populates="subscription")


class SubscriptionKey(Base, BaseModel):
    """
    Subscription Key model for accessing subscribed applications.

    This table stores API keys that users can use to access
    applications they have subscribed to.
    """

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subscription_id = Column(
        UUID(as_uuid=True),
        ForeignKey("subscription.id", ondelete="CASCADE"),
        nullable=False
    )
    name = Column(String(100), nullable=False)
    value = Column(String(255), unique=True, nullable=False)
    type = Column(String(20), nullable=False)
    remaining_usage_count = Column(Integer, nullable=True)
    rate_limit = Column(String(50), nullable=True)
    status = Column(
        String(20),
        default=ApiKeyStatus.ACTIVE.value
    )
    expire_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    subscription = relationship("Subscription", back_populates="subscription_keys")
