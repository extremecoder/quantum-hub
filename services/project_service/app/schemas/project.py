"""
Project schemas for the Project Service.

This module provides Pydantic models for project operations.
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """Base model for project operations."""
    name: str = Field(..., description="Name of the project")
    description: Optional[str] = Field(None, description="Description of the project")


class ProjectCreate(ProjectBase):
    """Model for creating a new project."""
    repo: Optional[str] = Field(None, description="Repository URL or name")


class ProjectUpdate(BaseModel):
    """Model for updating a project."""
    name: Optional[str] = Field(None, description="Name of the project")
    description: Optional[str] = Field(None, description="Description of the project")
    repo: Optional[str] = Field(None, description="Repository URL or name")


class ProjectInDB(ProjectBase):
    """Model for project stored in the database."""
    id: UUID
    user_id: UUID
    quantum_app_id: Optional[UUID] = None
    repo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Project(ProjectBase):
    """Model for project response."""
    id: UUID
    repo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class ProjectRelease(BaseModel):
    """Model for releasing a project as a quantum app."""
    name: str = Field(..., description="Name of the quantum app")
    description: Optional[str] = Field(None, description="Description of the quantum app")
    type: str = Field(..., description="Type of the quantum app")
    version_number: str = Field(..., description="Version number of the quantum app")
    sdk_used: str = Field(..., description="SDK used to build the quantum app")
    visibility: str = Field("PRIVATE", description="Visibility of the quantum app")
    input_schema: Optional[dict] = Field(None, description="Input schema for the quantum app")
    output_schema: Optional[dict] = Field(None, description="Output schema for the quantum app")
    preferred_platform: Optional[str] = Field(None, description="Preferred platform for the quantum app")
    preferred_device_id: Optional[str] = Field(None, description="Preferred device ID for the quantum app")
    number_of_qubits: Optional[int] = Field(None, description="Number of qubits used by the quantum app")
    package_path: Optional[str] = Field(None, description="Path to the package file")


class ProjectReleaseWithFile(ProjectRelease):
    """Model for releasing a project as a quantum app with a file upload."""
    package_data: Optional[bytes] = Field(None, description="Binary package data")


class QuantumApp(BaseModel):
    """Model for quantum app response."""
    id: UUID
    name: str
    description: Optional[str] = None
    type: str
    status: List[str]
    visibility: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
