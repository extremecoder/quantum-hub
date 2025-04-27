"""
Project management endpoints for the Project Service.

This module provides API endpoints for project management, including
creating, retrieving, updating, and deleting projects.
"""
from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession

from services.project_service.app.core.database import get_db
from services.project_service.app.core.security import get_current_user_id
from services.project_service.app.schemas.project import (
    Project, ProjectCreate, ProjectUpdate, ProjectRelease, QuantumApp
)
from services.project_service.app.services.project_service import (
    create_project, get_projects, get_project, update_project,
    delete_project, release_project, get_user_by_id
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
