"""
Execution-related database models.

This module contains all SQLAlchemy models related to quantum job execution,
including jobs, results, platforms, and devices.
"""
from datetime import datetime
from typing import List, Optional
import uuid

from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, 
    Integer, String, Text
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from ..base import Base, BaseModel
from ..enums import JobPriority, JobStatus, JobType


class Platform(Base, BaseModel):
    """
    Platform model representing quantum computing platforms.
    
    This table stores information about quantum computing platforms
    that can be used to execute quantum jobs.
    """
    
    name = Column(String(100), nullable=False)
    provider = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_simulator = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    api_endpoint = Column(String(255), nullable=True)
    sdk_integration = Column(String(100), nullable=True)
    
    # Relationships
    devices = relationship("Device", backref="platform", cascade="all, delete-orphan")


class Device(Base, BaseModel):
    """
    Device model representing specific quantum devices.
    
    This table stores information about quantum devices within platforms
    that can be used to execute quantum jobs.
    """
    
    platform_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("platform.id", ondelete="CASCADE"), 
        nullable=False
    )
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True)
    num_qubits = Column(Integer, nullable=False)
    quantum_volume = Column(Integer, nullable=True)
    properties = Column(JSONB, nullable=True)
    connectivity_map = Column(JSONB, nullable=True)
    queue_size = Column(Integer, nullable=True)
    average_queue_time_seconds = Column(Integer, nullable=True)
    
    # Relationships
    jobs = relationship("Job", backref="device")


class Job(Base, BaseModel):
    """
    Job model representing quantum computation jobs.
    
    This table stores information about quantum computation jobs
    submitted for execution, including their status and results.
    """
    
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("user.id", ondelete="CASCADE"), 
        nullable=False
    )
    app_version_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("app_version.id"), 
        nullable=True
    )
    platform_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("platform.id"), 
        nullable=False
    )
    device_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("device.id"), 
        nullable=False
    )
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)
    status = Column(
        String(20), 
        default=JobStatus.CREATED.value
    )
    priority = Column(
        String(20), 
        default=JobPriority.NORMAL.value
    )
    input_data = Column(JSONB, nullable=True)
    max_runtime_seconds = Column(Integer, nullable=True)
    queue_position = Column(Integer, nullable=True)
    scheduled_for = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cost = Column(Float, nullable=True)
    billing_reference = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)
    execution_log = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", backref="jobs")
    app_version = relationship("AppVersion", backref="jobs")
    platform = relationship("Platform", backref="jobs")
    device = relationship("Device", backref="jobs")
    result = relationship("JobResult", backref="job", uselist=False, cascade="all, delete-orphan")


class JobResult(Base, BaseModel):
    """
    Job Result model representing the results of quantum jobs.
    
    This table stores the results of quantum computation jobs,
    including raw data, processed results, and visualization data.
    """
    
    job_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("job.id", ondelete="CASCADE"), 
        unique=True, 
        nullable=False
    )
    result_data = Column(JSONB, nullable=False)
    raw_data = Column(JSONB, nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    shots = Column(Integer, nullable=True)
    success_rate = Column(Float, nullable=True)
    fidelity = Column(Float, nullable=True)
    visualization_data = Column(JSONB, nullable=True)
