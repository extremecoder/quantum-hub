"""
Tests for the Project Service file upload functionality.

This module contains tests for the file upload functionality in the Project Service.
"""
import io
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from services.shared.database.models import User, Project


@pytest.mark.asyncio
async def test_release_project_with_file(client: AsyncClient, test_project: Project):
    """Test releasing a project as a quantum app with a file upload."""
    # Create a test file
    file_content = b"This is a test file content"
    file = io.BytesIO(file_content)
    
    # Create form data
    form_data = {
        "name": "Released Quantum App With File",
        "description": "A released quantum app with a file upload",
        "type": "CIRCUIT",
        "version_number": "1.0.0",
        "sdk_used": "QISKIT",
        "visibility": "PRIVATE",
        "preferred_platform": "IBM",
        "preferred_device_id": "ibmq_qasm_simulator",
        "number_of_qubits": "5"
    }
    
    # Create files data
    files = {
        "package_file": ("test_package.zip", file, "application/zip")
    }
    
    # Send release request
    response = await client.post(
        f"/api/v1/projects/{test_project.id}/release/with-file",
        data=form_data,
        files=files
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Project released successfully with file upload"
    assert data["data"]["name"] == form_data["name"]
    assert data["data"]["description"] == form_data["description"]
    assert data["data"]["type"] == form_data["type"]
    assert data["data"]["visibility"] == form_data["visibility"]
    assert "DRAFT" in data["data"]["status"]
    
    # Get the version ID from the quantum app
    quantum_app_id = data["data"]["id"]
    
    # Get the quantum app details to find the version ID
    response = await client.get(f"/api/v1/quantum-apps/{quantum_app_id}")
    
    # This will fail because we don't have the quantum-apps endpoint yet
    # We'll need to implement that in the future
    # For now, we'll just check that the release was successful
    
    # TODO: Implement test for downloading the package file
    # Once we have the version ID, we can test downloading the package file
    # response = await client.get(f"/api/v1/projects/versions/{version_id}/download")
    # assert response.status_code == 200
    # assert response.content == file_content
