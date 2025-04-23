"""
Base model for SQLAlchemy models.

This module provides a BaseModel class with common fields and behaviors
for all database models in the Quantum Hub application.
"""
import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import Column, DateTime, MetaData, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base, declared_attr

# Naming convention for constraints
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

# Create metadata with naming convention
metadata = MetaData(naming_convention=convention)

# Create a base class for all models
Base = declarative_base(metadata=metadata)


class BaseModel:
    """
    Base model mixin providing common fields and behaviors for all models.
    
    This mixin adds:
    - UUID primary key
    - Created and updated timestamps
    - Table naming convention
    """
    
    # Primary key using UUID
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        nullable=False
    )
    
    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    # Table naming convention
    @declared_attr
    def __tablename__(cls) -> str:
        """
        Generate table name based on class name.
        
        Returns:
            str: The table name in snake_case format.
        """
        # Convert CamelCase to snake_case
        name = cls.__name__
        return "".join(["_" + c.lower() if c.isupper() else c for c in name]).lstrip("_")
