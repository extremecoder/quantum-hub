"""
Project service for the Project Service.

This module provides business logic for project management operations.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from services.project_service.app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRelease
from services.shared.database.models import Project, QuantumApp, AppVersion, User


async def create_project(
    db: AsyncSession, user_id: UUID, project_data: ProjectCreate
) -> Project:
    """
    Create a new project.

    Args:
        db: Database session.
        user_id: User ID.
        project_data: Project creation data.

    Returns:
        Project: The created project.
    """
    # Create the project
    project = Project(
        user_id=user_id,
        name=project_data.name,
        description=project_data.description,
        repo=project_data.repo
    )

    # Save to database
    db.add(project)
    await db.commit()
    await db.refresh(project)

    return project


async def get_projects(db: AsyncSession, user_id: UUID) -> List[Project]:
    """
    Get all projects for a user.

    Args:
        db: Database session.
        user_id: User ID.

    Returns:
        List[Project]: List of projects.
    """
    result = await db.execute(
        select(Project).where(Project.user_id == user_id)
    )
    return result.scalars().all()


async def get_project(db: AsyncSession, user_id: UUID, project_id: UUID) -> Optional[Project]:
    """
    Get a specific project for a user.

    Args:
        db: Database session.
        user_id: User ID.
        project_id: Project ID.

    Returns:
        Optional[Project]: The project if found, None otherwise.
    """
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == user_id
        )
    )
    return result.scalars().first()


async def update_project(
    db: AsyncSession, user_id: UUID, project_id: UUID, project_data: ProjectUpdate
) -> Optional[Project]:
    """
    Update a project.

    Args:
        db: Database session.
        user_id: User ID.
        project_id: Project ID.
        project_data: Project update data.

    Returns:
        Optional[Project]: The updated project if found, None otherwise.
    """
    # Check if project exists
    project = await get_project(db, user_id, project_id)
    if not project:
        return None

    # Update fields
    update_data = project_data.dict(exclude_unset=True)

    if update_data:
        await db.execute(
            update(Project)
            .where(Project.id == project_id)
            .values(**update_data)
        )
        await db.commit()
        await db.refresh(project)

    return project


async def delete_project(db: AsyncSession, user_id: UUID, project_id: UUID) -> bool:
    """
    Delete a project.

    Args:
        db: Database session.
        user_id: User ID.
        project_id: Project ID.

    Returns:
        bool: True if the project was deleted, False otherwise.
    """
    # Check if project exists
    project = await get_project(db, user_id, project_id)
    if not project:
        return False

    # Delete the project
    await db.execute(
        delete(Project)
        .where(Project.id == project_id)
    )
    await db.commit()

    return True


async def release_project(
    db: AsyncSession, user_id: UUID, project_id: UUID, release_data: ProjectRelease,
    package_data: Optional[bytes] = None
) -> Optional[QuantumApp]:
    """
    Release a project as a quantum app.

    Args:
        db: Database session.
        user_id: User ID.
        project_id: Project ID.
        release_data: Project release data.
        package_data: Optional binary package data.

    Returns:
        Optional[QuantumApp]: The created quantum app if successful, None otherwise.
    """
    # Check if project exists
    project = await get_project(db, user_id, project_id)
    if not project:
        return None

    # Validate project can be released
    if project.quantum_app_id:
        # Project already has a quantum app, check if we're updating
        # For now, we'll just create a new version if it already exists
        pass

    # Create the quantum app
    quantum_app = QuantumApp(
        developer_id=user_id,
        name=release_data.name,
        description=release_data.description,
        type=release_data.type,
        status=["DRAFT"],
        visibility=release_data.visibility,
        repository_url=project.repo
    )

    # Save to database
    db.add(quantum_app)
    await db.commit()
    await db.refresh(quantum_app)

    # Create the app version
    app_version = AppVersion(
        quantum_app_id=quantum_app.id,
        version_number=release_data.version_number,
        sdk_used=release_data.sdk_used,
        input_schema=release_data.input_schema,
        output_schema=release_data.output_schema,
        preferred_platform=release_data.preferred_platform,
        preferred_device_id=release_data.preferred_device_id,
        number_of_qubits=release_data.number_of_qubits,
        package_path=release_data.package_path,
        package_data=package_data,  # Store the binary package data
        source_repo=project.repo,
        is_latest=True,
        status="DRAFT"
    )

    # Save to database
    db.add(app_version)
    await db.commit()
    await db.refresh(app_version)

    # Update the quantum app with the latest version
    quantum_app.latest_version_id = app_version.id
    await db.commit()
    await db.refresh(quantum_app)

    # Update the project with the quantum app
    project.quantum_app_id = quantum_app.id
    await db.commit()

    return quantum_app


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """
    Get a user by ID.

    Args:
        db: Database session.
        user_id: User ID.

    Returns:
        Optional[User]: The user if found, None otherwise.
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalars().first()


async def get_app_version(db: AsyncSession, version_id: UUID) -> Optional[AppVersion]:
    """
    Get an app version by ID.

    Args:
        db: Database session.
        version_id: Version ID.

    Returns:
        Optional[AppVersion]: The app version if found, None otherwise.
    """
    result = await db.execute(
        select(AppVersion).where(AppVersion.id == version_id)
    )
    return result.scalars().first()


async def get_quantum_app(db: AsyncSession, app_id: UUID) -> Optional[QuantumApp]:
    """
    Get a quantum app by ID.

    Args:
        db: Database session.
        app_id: Quantum app ID.

    Returns:
        Optional[QuantumApp]: The quantum app if found, None otherwise.
    """
    result = await db.execute(
        select(QuantumApp).where(QuantumApp.id == app_id)
    )
    return result.scalars().first()


async def get_app_package(db: AsyncSession, version_id: UUID) -> Optional[tuple[bytes, str]]:
    """
    Get the package data for an app version.

    Args:
        db: Database session.
        version_id: Version ID.

    Returns:
        Optional[tuple[bytes, str]]: Tuple of (package_data, filename) if found, None otherwise.
    """
    app_version = await get_app_version(db, version_id)
    if not app_version or not app_version.package_data:
        return None

    return (app_version.package_data, app_version.package_path or "package.zip")
