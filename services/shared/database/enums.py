"""
Enum types for database models.

This module defines all the enum types used across the Quantum Hub application's
database models for consistent typing and validation.
"""
import enum
from typing import Any, Dict, List, Optional, Type, Union
import sqlalchemy as sa


# SQLAlchemy-compatible Enum mixin
class EnumStr(str, enum.Enum):
    """
    Enum class with string values that is compatible with SQLAlchemy and SQLModel.
    
    All other enums should inherit from this class for proper database compatibility.
    """
    @classmethod
    def __get_validators__(cls) -> List[Any]:
        """
        Get validators for Pydantic compatibility.
        
        Returns:
            List[Any]: List of validator callables.
        """
        return [cls.validate]
    
    @classmethod
    def validate(cls, v: Any) -> Any:
        """
        Validate the value against the enum.
        
        Args:
            v: Value to validate.
            
        Returns:
            The validated enum value.
            
        Raises:
            ValueError: If the value is not a valid enum value.
        """
        if isinstance(v, cls):
            return v
        if isinstance(v, str):
            try:
                return cls(v)
            except ValueError:
                raise ValueError(f"Invalid value '{v}' for {cls.__name__}")
        raise ValueError(f"Cannot convert {v} to {cls.__name__}")


class ApiKeyStatus(EnumStr):
    """Status values for API keys and subscription keys."""
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"


class AppType(EnumStr):
    """Types of quantum applications."""
    ALGORITHM = "algorithm"
    CIRCUIT = "circuit"
    MODEL = "model"
    TOOL = "tool"
    AGENT = "agent"
    LIBRARY = "library"
    OTHER = "other"


class AppVisibility(EnumStr):
    """Visibility options for applications."""
    PUBLIC = "public"
    PRIVATE = "private"
    RESTRICTED = "restricted"


class LicenseType(EnumStr):
    """License types for quantum applications."""
    MIT = "mit"
    APACHE2 = "apache2"
    GPL3 = "gpl3"
    BSD = "bsd"
    PROPRIETARY = "proprietary"
    OTHER = "other"


class VersionStatus(EnumStr):
    """Status values for application versions."""
    DRAFT = "draft"
    TESTING = "testing"
    RELEASED = "released"
    DEPRECATED = "deprecated"


class SDKType(EnumStr):
    """Supported quantum SDKs."""
    QISKIT = "qiskit"
    CIRQ = "cirq"
    PENNYLANE = "pennylane"
    QUANTUM_CLI = "quantum_cli"
    QSHARP = "qsharp"
    PYQUIL = "pyquil"
    BRAKET = "braket"
    OTHER = "other"


class MarketplaceListingStatus(EnumStr):
    """Status values for marketplace listings."""
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELISTED = "delisted"


class SubscriptionType(EnumStr):
    """Types of application subscriptions."""
    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"


class SubscriptionStatus(EnumStr):
    """Status values for subscriptions."""
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    SUSPENDED = "suspended"


class JobStatus(EnumStr):
    """Status values for execution jobs."""
    CREATED = "created"
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobType(EnumStr):
    """Types of execution jobs."""
    SIMULATION = "simulation"
    HARDWARE = "hardware"
    HYBRID = "hybrid"


class JobPriority(EnumStr):
    """Priority levels for execution jobs."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class BillingPlanType(EnumStr):
    """Types of billing plans."""
    FREE = "free"
    MONTHLY = "monthly"
    ANNUAL = "annual"
    USAGE_BASED = "usage_based"
    CUSTOM = "custom"


class InvoiceStatus(EnumStr):
    """Status values for invoices."""
    DRAFT = "draft"
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"
