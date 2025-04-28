"""
Tests for the upload functionality.

This module provides tests for the upload functionality of the Quantum App Service.
"""
import io
import json
import zipfile
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from services.shared.database.models import User, QuantumApp


def create_test_package(manifest_data, qasm_content="OPENQASM 2.0;"):
    """Create a test package with manifest and QASM file."""
    # Create a BytesIO object to hold the zip file
    zip_buffer = io.BytesIO()
    
    # Create a zip file
    with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
        # Add manifest
        manifest_json = json.dumps(manifest_data)
        zip_file.writestr('quantum_manifest.json', manifest_json)
        
        # Add QASM file
        zip_file.writestr('test.qasm', qasm_content)
    
    # Get the binary data
    zip_buffer.seek(0)
    return zip_buffer


@pytest.mark.asyncio
async def test_upload_app_package(client: AsyncClient, test_user: User):
    """Test uploading a quantum app package."""
    # Create test manifest
    manifest_data = {
        "name": "Test Quantum App",
        "description": "A test quantum app",
        "type": "CIRCUIT",
        "version_number": "1.0.0",
        "sdk_used": "QISKIT",
        "visibility": "PRIVATE",
        "preferred_platform": "IBM",
        "preferred_device_id": "ibmq_qasm_simulator",
        "number_of_qubits": 5,
        "qasm_files": ["test.qasm"]
    }
    
    # Create test package
    package_file = create_test_package(manifest_data)
    
    # Create files data
    files = {
        "package_file": ("test_package.zip", package_file, "application/zip")
    }
    
    # Send upload request
    response = await client.post(
        "/api/v1/quantum-apps/upload",
        files=files
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Quantum app package uploaded successfully"
    assert data["data"]["name"] == manifest_data["name"]
    assert data["data"]["description"] == manifest_data["description"]
    assert data["data"]["type"] == manifest_data["type"]
    assert data["data"]["visibility"] == manifest_data["visibility"]
    assert "DRAFT" in data["data"]["status"]
    
    # Get the quantum app ID
    quantum_app_id = data["data"]["id"]
    
    # Get the quantum app details
    response = await client.get(f"/api/v1/quantum-apps/{quantum_app_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["versions"]) == 1
    assert data["data"]["versions"][0]["version_number"] == manifest_data["version_number"]
    assert data["data"]["versions"][0]["sdk_used"] == manifest_data["sdk_used"]
    assert data["data"]["versions"][0]["preferred_platform"] == manifest_data["preferred_platform"]
    assert data["data"]["versions"][0]["preferred_device_id"] == manifest_data["preferred_device_id"]
    assert data["data"]["versions"][0]["number_of_qubits"] == manifest_data["number_of_qubits"]


@pytest.mark.asyncio
async def test_upload_app_package_update_existing(client: AsyncClient, test_user: User, test_quantum_app: QuantumApp):
    """Test uploading a quantum app package that updates an existing app."""
    # Create test manifest with same name as existing app
    manifest_data = {
        "name": test_quantum_app.name,
        "description": "Updated description",
        "type": test_quantum_app.type,
        "version_number": "2.0.0",  # New version
        "sdk_used": "QISKIT",
        "visibility": "PRIVATE",
        "preferred_platform": "IBM",
        "preferred_device_id": "ibmq_qasm_simulator",
        "number_of_qubits": 5,
        "qasm_files": ["test.qasm"]
    }
    
    # Create test package
    package_file = create_test_package(manifest_data)
    
    # Create files data
    files = {
        "package_file": ("test_package.zip", package_file, "application/zip")
    }
    
    # Send upload request
    response = await client.post(
        "/api/v1/quantum-apps/upload",
        files=files
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Quantum app package uploaded successfully"
    assert data["data"]["id"] == str(test_quantum_app.id)  # Same ID as existing app
    assert data["data"]["name"] == manifest_data["name"]
    assert data["data"]["description"] == manifest_data["description"]
    
    # Get the quantum app details
    response = await client.get(f"/api/v1/quantum-apps/{test_quantum_app.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["versions"]) == 2  # Now has 2 versions
    
    # Check that the new version is the latest
    latest_version = data["data"]["latest_version"]
    assert latest_version["version_number"] == manifest_data["version_number"]


@pytest.mark.asyncio
async def test_upload_invalid_package(client: AsyncClient, test_user: User):
    """Test uploading an invalid quantum app package."""
    # Create invalid package (no manifest)
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
        zip_file.writestr('test.qasm', "OPENQASM 2.0;")
    zip_buffer.seek(0)
    
    # Create files data
    files = {
        "package_file": ("invalid_package.zip", zip_buffer, "application/zip")
    }
    
    # Send upload request
    response = await client.post(
        "/api/v1/quantum-apps/upload",
        files=files
    )
    
    # Check response
    assert response.status_code == 500
    data = response.json()
    assert "Invalid package" in data["detail"]
