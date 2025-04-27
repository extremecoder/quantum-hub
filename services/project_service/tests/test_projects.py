"""
Tests for the Project Service project endpoints.

This module contains tests for the project endpoints, including
creating, retrieving, updating, and deleting projects.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from services.shared.database.models import User, Project


@pytest.mark.asyncio
async def test_create_project(client: AsyncClient, test_user: User):
    """Test project creation."""
    # Create project data
    project_data = {
        "name": "New Project",
        "description": "A new test project",
        "repo": "https://github.com/test/new-project"
    }
    
    # Send create request
    response = await client.post(
        "/api/v1/projects",
        json=project_data
    )
    
    # Check response
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Project created successfully"
    assert data["data"]["name"] == project_data["name"]
    assert data["data"]["description"] == project_data["description"]
    assert data["data"]["repo"] == project_data["repo"]


@pytest.mark.asyncio
async def test_get_projects(client: AsyncClient, test_project: Project):
    """Test retrieving projects."""
    # Send get request
    response = await client.get("/api/v1/projects")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Projects retrieved successfully"
    assert len(data["data"]) >= 1
    
    # Check that the test project is in the list
    project_names = [p["name"] for p in data["data"]]
    assert test_project.name in project_names


@pytest.mark.asyncio
async def test_get_project(client: AsyncClient, test_project: Project):
    """Test retrieving a specific project."""
    # Send get request
    response = await client.get(f"/api/v1/projects/{test_project.id}")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Project retrieved successfully"
    assert data["data"]["name"] == test_project.name
    assert data["data"]["description"] == test_project.description
    assert data["data"]["repo"] == test_project.repo


@pytest.mark.asyncio
async def test_update_project(client: AsyncClient, test_project: Project):
    """Test updating a project."""
    # Create update data
    update_data = {
        "name": "Updated Project",
        "description": "An updated test project"
    }
    
    # Send update request
    response = await client.put(
        f"/api/v1/projects/{test_project.id}",
        json=update_data
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Project updated successfully"
    assert data["data"]["name"] == update_data["name"]
    assert data["data"]["description"] == update_data["description"]
    
    # Repo should remain unchanged
    assert data["data"]["repo"] == test_project.repo


@pytest.mark.asyncio
async def test_delete_project(client: AsyncClient, test_project: Project):
    """Test deleting a project."""
    # Send delete request
    response = await client.delete(f"/api/v1/projects/{test_project.id}")
    
    # Check response
    assert response.status_code == 204
    
    # Verify project is deleted
    response = await client.get(f"/api/v1/projects/{test_project.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_release_project(client: AsyncClient, test_project: Project):
    """Test releasing a project as a quantum app."""
    # Create release data
    release_data = {
        "name": "Released Quantum App",
        "description": "A released quantum app",
        "type": "CIRCUIT",
        "version_number": "1.0.0",
        "sdk_used": "QISKIT",
        "visibility": "PRIVATE",
        "input_schema": {"type": "object", "properties": {}},
        "output_schema": {"type": "object", "properties": {}},
        "preferred_platform": "IBM",
        "preferred_device_id": "ibmq_qasm_simulator",
        "number_of_qubits": 5
    }
    
    # Send release request
    response = await client.post(
        f"/api/v1/projects/{test_project.id}/release",
        json=release_data
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Project released successfully"
    assert data["data"]["name"] == release_data["name"]
    assert data["data"]["description"] == release_data["description"]
    assert data["data"]["type"] == release_data["type"]
    assert data["data"]["visibility"] == release_data["visibility"]
    assert "DRAFT" in data["data"]["status"]
