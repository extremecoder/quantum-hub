"""
Schemas for quantum applications.

This module defines Pydantic models for quantum applications and their versions.
"""
from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import UUID

from pydantic import BaseModel, Field


class AppVersionBase(BaseModel):
    """Base model for app version."""
    version_number: str = Field(..., description="Version number of the quantum app")
    sdk_used: str = Field(..., description="SDK used to build the quantum app")
    input_schema: Optional[Dict[str, Any]] = Field(None, description="Input schema for the quantum app")
    output_schema: Optional[Dict[str, Any]] = Field(None, description="Output schema for the quantum app")
    preferred_platform: Optional[str] = Field(None, description="Preferred platform for the quantum app")
    preferred_device_id: Optional[str] = Field(None, description="Preferred device ID for the quantum app")
    number_of_qubits: Optional[int] = Field(None, description="Number of qubits used by the quantum app")
    release_notes: Optional[str] = Field(None, description="Release notes for this version")


class AppVersionCreate(AppVersionBase):
    """Model for creating an app version."""
    pass


class AppVersion(AppVersionBase):
    """Model for app version response."""
    id: UUID
    quantum_app_id: UUID
    created_at: datetime
    updated_at: datetime
    is_latest: bool
    status: str
    package_path: Optional[str] = None
    
    class Config:
        """Pydantic config."""
        orm_mode = True


class QuantumAppBase(BaseModel):
    """Base model for quantum app."""
    name: str = Field(..., description="Name of the quantum app")
    description: Optional[str] = Field(None, description="Description of the quantum app")
    type: str = Field(..., description="Type of the quantum app")
    visibility: str = Field("PRIVATE", description="Visibility of the quantum app")
    api_url: Optional[str] = Field(None, description="API URL for the quantum app")
    documentation_url: Optional[str] = Field(None, description="Documentation URL for the quantum app")
    license_type: Optional[str] = Field(None, description="License type for the quantum app")
    license_url: Optional[str] = Field(None, description="License URL for the quantum app")
    readme_content: Optional[str] = Field(None, description="README content for the quantum app")
    repository_url: Optional[str] = Field(None, description="Repository URL for the quantum app")


class QuantumAppCreate(QuantumAppBase):
    """Model for creating a quantum app."""
    pass


class QuantumAppUpdate(BaseModel):
    """Model for updating a quantum app."""
    name: Optional[str] = Field(None, description="Name of the quantum app")
    description: Optional[str] = Field(None, description="Description of the quantum app")
    type: Optional[str] = Field(None, description="Type of the quantum app")
    visibility: Optional[str] = Field(None, description="Visibility of the quantum app")
    api_url: Optional[str] = Field(None, description="API URL for the quantum app")
    documentation_url: Optional[str] = Field(None, description="Documentation URL for the quantum app")
    license_type: Optional[str] = Field(None, description="License type for the quantum app")
    license_url: Optional[str] = Field(None, description="License URL for the quantum app")
    readme_content: Optional[str] = Field(None, description="README content for the quantum app")
    repository_url: Optional[str] = Field(None, description="Repository URL for the quantum app")


class QuantumApp(QuantumAppBase):
    """Model for quantum app response."""
    id: UUID
    developer_id: UUID
    status: List[str]
    created_at: datetime
    updated_at: datetime
    latest_version_id: Optional[UUID] = None
    
    class Config:
        """Pydantic config."""
        orm_mode = True


class QuantumAppWithVersions(QuantumApp):
    """Model for quantum app response with versions."""
    versions: List[AppVersion] = []
    latest_version: Optional[AppVersion] = None
