"""
Application-related database models.

This module contains all SQLAlchemy models related to quantum applications,
projects, and versions.
"""
from datetime import datetime
from typing import List, Optional
import uuid

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer,
    LargeBinary, String, Text
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import relationship

from ..base import Base, BaseModel
from ..enums import AppType, AppVisibility, LicenseType, SDKType, VersionStatus


class Project(Base, BaseModel):
    """
    Project model representing user development projects.

    This table stores information about development projects that users
    create to build and modify quantum applications.
    """

    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False
    )
    quantum_app_id = Column(
        UUID(as_uuid=True),
        ForeignKey("quantum_app.id"),
        nullable=True
    )
    repo = Column(String(255), nullable=True)

    # Relationships
    user = relationship("User", backref="projects")
    quantum_app = relationship("QuantumApp", back_populates="projects")


class QuantumApp(Base, BaseModel):
    """
    Quantum App model representing quantum applications.

    This table stores information about quantum applications that can be
    distributed through the registry or marketplace.
    """

    developer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("user.id"),
        nullable=False
    )
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(50), nullable=False)
    status = Column(ARRAY(String), nullable=False, default=["DRAFT"])
    visibility = Column(String(20), nullable=False, default=AppVisibility.PRIVATE.value)
    latest_version_id = Column(
        UUID(as_uuid=True),
        ForeignKey("app_version.id"),
        nullable=True
    )
    api_url = Column(String(255), nullable=True)
    documentation_url = Column(String(255), nullable=True)
    license_type = Column(String(20), default=LicenseType.MIT.value)
    license_url = Column(String(255), nullable=True)
    readme_content = Column(Text, nullable=True)
    repository_url = Column(String(255), nullable=True)

    # Registry-specific fields
    is_in_registry = Column(Boolean, default=False)
    registry_published_at = Column(DateTime(timezone=True), nullable=True)
    featured_in_registry = Column(Boolean, default=False)
    registry_download_count = Column(Integer, default=0)

    # Relationships
    developer = relationship("User", backref="developed_apps")
    latest_version = relationship(
        "AppVersion",
        foreign_keys=[latest_version_id],
        post_update=True
    )
    # Remove backref to avoid circular dependency
    projects = relationship("Project", back_populates="quantum_app")
    # Remove backref to avoid circular dependency with MarketplaceListing
    marketplace_listing = relationship("MarketplaceListing", uselist=False, back_populates="quantum_app")


class AppVersion(Base, BaseModel):
    """
    App Version model representing versions of quantum applications.

    This table stores information about specific versions of quantum applications,
    including their packages, schemas, and performance metrics.
    """

    quantum_app_id = Column(
        UUID(as_uuid=True),
        ForeignKey("quantum_app.id", ondelete="CASCADE"),
        nullable=False
    )
    version_number = Column(String(20), nullable=False)
    sdk_used = Column(String(20), nullable=False)
    input_schema = Column(JSONB, nullable=True)
    output_schema = Column(JSONB, nullable=True)
    built_on_quantum_sdk_version = Column(String(50), nullable=True)
    preferred_platform = Column(String(50), nullable=True)
    preferred_device_id = Column(String(50), nullable=True)
    number_of_qubits = Column(Integer, nullable=True)
    average_execution_time = Column(String(50), nullable=True)
    source_repo = Column(String(255), nullable=True)
    source_commit_hash = Column(String(100), nullable=True)
    package_path = Column(String(255), nullable=True)
    package_data = Column(LargeBinary, nullable=True)
    ir_type = Column(String(50), nullable=True)
    ir_path = Column(String(255), nullable=True)
    resource_estimate = Column(JSONB, nullable=True)
    cost_estimate = Column(JSONB, nullable=True)
    benchmark_results = Column(JSONB, nullable=True)
    finetune_params = Column(JSONB, nullable=True)
    validation_results = Column(JSONB, nullable=True)
    security_scan_results = Column(JSONB, nullable=True)
    release_notes = Column(Text, nullable=True)
    is_latest = Column(Boolean, default=False)
    status = Column(String(20), default=VersionStatus.DRAFT.value)

    # Relationships
    quantum_app = relationship(
        "QuantumApp",
        backref="versions",
        foreign_keys=[quantum_app_id]
    )
