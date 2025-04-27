"""
Project management endpoints for the Project Service.

This module provides API endpoints for project management, including
creating, retrieving, updating, and deleting projects.
"""
from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Header, Response
from sqlalchemy.ext.asyncio import AsyncSession

from services.project_service.app.core.database import get_db
from services.project_service.app.core.security import get_current_user_id
from services.project_service.app.schemas.project import (
    Project, ProjectCreate, ProjectUpdate, ProjectRelease, QuantumApp
)
from services.project_service.app.services.project_service import (
    create_project, get_projects, get_project, update_project,
    delete_project, release_project, get_user_by_id, get_app_version,
    get_quantum_app, get_app_package
)
from services.shared.utils.api import create_response, raise_http_exception

# Create router
router = APIRouter()


@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project_endpoint(
    project_data: ProjectCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Create a new project.

    Args:
        project_data: Project creation data.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        Project: The created project.
    """
    try:
        # Check if user exists
        user = await get_user_by_id(db, user_id)
        if not user:
            raise_http_exception(
                message="User not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

        project = await create_project(db, user_id, project_data)
    except Exception as e:
        raise_http_exception(
            message=f"Failed to create project: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return create_response(
        data=project,
        message="Project created successfully"
    )


@router.get("", response_model=List[Project])
async def get_projects_endpoint(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get all projects for the current user.

    Args:
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        List[Project]: List of projects.
    """
    try:
        projects = await get_projects(db, user_id)

        return create_response(
            data=projects,
            message="Projects retrieved successfully"
        )
    except Exception as e:
        raise_http_exception(
            message=f"Failed to retrieve projects: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/{project_id}", response_model=Project)
async def get_project_endpoint(
    project_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get a specific project.

    Args:
        project_id: Project ID.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        Project: The project.
    """
    project = await get_project(db, user_id, project_id)

    if not project:
        raise_http_exception(
            message="Project not found",
            status_code=status.HTTP_404_NOT_FOUND
        )

    return create_response(
        data=project,
        message="Project retrieved successfully"
    )


@router.put("/{project_id}", response_model=Project)
async def update_project_endpoint(
    project_id: UUID,
    project_data: ProjectUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Update a project.

    Args:
        project_id: Project ID.
        project_data: Project update data.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        Project: The updated project.
    """
    project = await update_project(db, user_id, project_id, project_data)

    if not project:
        raise_http_exception(
            message="Project not found",
            status_code=status.HTTP_404_NOT_FOUND
        )

    return create_response(
        data=project,
        message="Project updated successfully"
    )


@router.delete("/{project_id}")
async def delete_project_endpoint(
    project_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Delete a project.

    Args:
        project_id: Project ID.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        dict: Success message.
    """
    result = await delete_project(db, user_id, project_id)

    if not result:
        raise_http_exception(
            message="Project not found",
            status_code=status.HTTP_404_NOT_FOUND
        )

    return create_response(
        data=None,
        message="Project deleted successfully"
    )


@router.post("/{project_id}/release", response_model=QuantumApp)
async def release_project_endpoint(
    project_id: UUID,
    release_data: ProjectRelease,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Release a project as a quantum app.

    Args:
        project_id: Project ID.
        release_data: Project release data.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        QuantumApp: The created quantum app.
    """
    try:
        quantum_app = await release_project(db, user_id, project_id, release_data)

        if not quantum_app:
            raise_http_exception(
                message="Project not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

        return create_response(
            data=quantum_app,
            message="Project released successfully"
        )
    except Exception as e:
        raise_http_exception(
            message=f"Failed to release project: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


from fastapi import File, UploadFile, Form
from services.project_service.app.schemas.project import ProjectReleaseWithFile


@router.post("/{project_id}/release/with-file", response_model=QuantumApp)
async def release_project_with_file_endpoint(
    project_id: UUID,
    name: str = Form(...),
    description: str = Form(None),
    type: str = Form(...),
    version_number: str = Form(...),
    sdk_used: str = Form(...),
    visibility: str = Form("PRIVATE"),
    preferred_platform: str = Form(None),
    preferred_device_id: str = Form(None),
    number_of_qubits: int = Form(None),
    package_file: UploadFile = File(...),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Release a project as a quantum app with a file upload.

    Args:
        project_id: Project ID.
        name: Name of the quantum app.
        description: Description of the quantum app.
        type: Type of the quantum app.
        version_number: Version number of the quantum app.
        sdk_used: SDK used to build the quantum app.
        visibility: Visibility of the quantum app.
        preferred_platform: Preferred platform for the quantum app.
        preferred_device_id: Preferred device ID for the quantum app.
        number_of_qubits: Number of qubits used by the quantum app.
        package_file: Package file to upload.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        QuantumApp: The created quantum app.
    """
    try:
        # Read the file content
        package_data = await package_file.read()

        # Create release data
        release_data = ProjectRelease(
            name=name,
            description=description,
            type=type,
            version_number=version_number,
            sdk_used=sdk_used,
            visibility=visibility,
            preferred_platform=preferred_platform,
            preferred_device_id=preferred_device_id,
            number_of_qubits=number_of_qubits,
            package_path=package_file.filename
        )

        # Release the project
        quantum_app = await release_project(
            db, user_id, project_id, release_data, package_data
        )

        if not quantum_app:
            raise_http_exception(
                message="Project not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

        return create_response(
            data=quantum_app,
            message="Project released successfully with file upload"
        )
    except Exception as e:
        raise_http_exception(
            message=f"Failed to release project with file: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/versions/{version_id}/download")
async def download_package_endpoint(
    version_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Download the package file for an app version.

    Args:
        version_id: Version ID.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        Response: The package file as a downloadable response.
    """
    try:
        # Get the package data
        package_data = await get_app_package(db, version_id)

        if not package_data:
            raise_http_exception(
                message="Package not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Return the package file
        content, filename = package_data
        return Response(
            content=content,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise_http_exception(
            message=f"Failed to download package: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
