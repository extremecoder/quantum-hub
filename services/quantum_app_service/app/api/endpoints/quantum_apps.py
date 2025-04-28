"""
Quantum app management endpoints for the Quantum App Service.

This module provides API endpoints for quantum app management, including
creating, retrieving, updating, and deleting quantum apps.
"""
from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from services.quantum_app_service.app.core.database import get_db
from services.quantum_app_service.app.core.security import get_current_user_id
from services.quantum_app_service.app.schemas.quantum_app import (
    QuantumApp, QuantumAppCreate, QuantumAppUpdate, QuantumAppWithVersions,
    AppVersion
)
from services.quantum_app_service.app.services.quantum_app_service import (
    get_quantum_apps, get_quantum_app, create_quantum_app, update_quantum_app,
    delete_quantum_app, get_app_versions, get_app_version, create_app_version,
    get_app_package, upload_app_package
)
from services.shared.utils.api import create_response, raise_http_exception

# Create router
router = APIRouter()


@router.get("", response_model=List[QuantumApp])
async def get_quantum_apps_endpoint(
    user_id: Optional[UUID] = None,
    current_user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get all quantum apps, optionally filtered by user ID.

    Args:
        user_id: Optional user ID to filter by.
        current_user_id: Current user ID.
        db: Database session dependency.

    Returns:
        List[QuantumApp]: List of quantum apps.
    """
    try:
        # If user_id is not provided, use current user ID
        filter_user_id = user_id or current_user_id

        apps = await get_quantum_apps(db, filter_user_id)

        return create_response(
            data=apps,
            message="Quantum apps retrieved successfully"
        )
    except Exception as e:
        raise_http_exception(
            message=f"Failed to retrieve quantum apps: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.post("", response_model=QuantumApp, status_code=status.HTTP_201_CREATED)
async def create_quantum_app_endpoint(
    app_data: QuantumAppCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Create a new quantum app.

    Args:
        app_data: Quantum app creation data.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        QuantumApp: The created quantum app.
    """
    try:
        quantum_app = await create_quantum_app(db, user_id, app_data.dict())

        return create_response(
            data=quantum_app,
            message="Quantum app created successfully"
        )
    except Exception as e:
        raise_http_exception(
            message=f"Failed to create quantum app: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/{app_id}", response_model=QuantumAppWithVersions)
async def get_quantum_app_endpoint(
    app_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get a quantum app by ID.

    Args:
        app_id: Quantum app ID.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        QuantumAppWithVersions: The quantum app with its versions.
    """
    try:
        # Get the quantum app
        quantum_app = await get_quantum_app(db, app_id)

        if not quantum_app:
            raise_http_exception(
                message="Quantum app not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Get the app versions
        versions = await get_app_versions(db, app_id)

        # Get the latest version
        latest_version = None
        if quantum_app.latest_version_id:
            latest_version = await get_app_version(db, quantum_app.latest_version_id)

        # Create response
        response_data = QuantumAppWithVersions(
            **quantum_app.__dict__,
            versions=versions,
            latest_version=latest_version
        )

        return create_response(
            data=response_data,
            message="Quantum app retrieved successfully"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise_http_exception(
            message=f"Failed to retrieve quantum app: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.put("/{app_id}", response_model=QuantumApp)
async def update_quantum_app_endpoint(
    app_id: UUID,
    app_data: QuantumAppUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Update a quantum app.

    Args:
        app_id: Quantum app ID.
        app_data: Quantum app update data.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        QuantumApp: The updated quantum app.
    """
    try:
        quantum_app = await update_quantum_app(db, app_id, user_id, app_data.dict(exclude_unset=True))

        if not quantum_app:
            raise_http_exception(
                message="Quantum app not found or you don't have permission to update it",
                status_code=status.HTTP_404_NOT_FOUND
            )

        return create_response(
            data=quantum_app,
            message="Quantum app updated successfully"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise_http_exception(
            message=f"Failed to update quantum app: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.delete("/{app_id}")
async def delete_quantum_app_endpoint(
    app_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Delete a quantum app.

    Args:
        app_id: Quantum app ID.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        dict: Success message.
    """
    try:
        result = await delete_quantum_app(db, app_id, user_id)

        if not result:
            raise_http_exception(
                message="Quantum app not found or you don't have permission to delete it",
                status_code=status.HTTP_404_NOT_FOUND
            )

        return create_response(
            data=None,
            message="Quantum app deleted successfully"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise_http_exception(
            message=f"Failed to delete quantum app: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/{app_id}/versions", response_model=List[AppVersion])
async def get_app_versions_endpoint(
    app_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get all versions of a quantum app.

    Args:
        app_id: Quantum app ID.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        List[AppVersion]: List of app versions.
    """
    try:
        # Check if quantum app exists
        quantum_app = await get_quantum_app(db, app_id)

        if not quantum_app:
            raise_http_exception(
                message="Quantum app not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Get the app versions
        versions = await get_app_versions(db, app_id)

        return create_response(
            data=versions,
            message="App versions retrieved successfully"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise_http_exception(
            message=f"Failed to retrieve app versions: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/{app_id}/versions/{version_id}", response_model=AppVersion)
async def get_app_version_endpoint(
    app_id: UUID,
    version_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get an app version by ID.

    Args:
        app_id: Quantum app ID.
        version_id: Version ID.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        AppVersion: The app version.
    """
    try:
        # Check if quantum app exists
        quantum_app = await get_quantum_app(db, app_id)

        if not quantum_app:
            raise_http_exception(
                message="Quantum app not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Get the app version
        app_version = await get_app_version(db, version_id)

        if not app_version or app_version.quantum_app_id != app_id:
            raise_http_exception(
                message="App version not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

        return create_response(
            data=app_version,
            message="App version retrieved successfully"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise_http_exception(
            message=f"Failed to retrieve app version: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/{app_id}/versions/{version_id}/download")
async def download_package_endpoint(
    app_id: UUID,
    version_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Download the package file for an app version.

    Args:
        app_id: Quantum app ID.
        version_id: Version ID.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        Response: The package file as a downloadable response.
    """
    try:
        # Check if quantum app exists
        quantum_app = await get_quantum_app(db, app_id)

        if not quantum_app:
            raise_http_exception(
                message="Quantum app not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

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
        if isinstance(e, HTTPException):
            raise e
        raise_http_exception(
            message=f"Failed to download package: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.post("/upload")
async def upload_app_package_endpoint(
    package_file: UploadFile = File(...),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Upload a quantum app package.

    This endpoint accepts a zip file containing a quantum_manifest.json file
    and .qasm files. The manifest file is used to create or update a quantum app
    and create a new version.

    Args:
        package_file: Zip file containing quantum_manifest.json and .qasm files.
        user_id: Current user ID.
        db: Database session dependency.

    Returns:
        QuantumApp: The created or updated quantum app.
    """
    try:
        # Read the file content
        package_data = await package_file.read()

        # Upload the package
        quantum_app = await upload_app_package(
            db, user_id, package_data, package_file.filename
        )

        if not quantum_app:
            raise_http_exception(
                message="Failed to upload package",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Convert the SQLAlchemy model to a dictionary
        app_dict = {
            "id": quantum_app.id,
            "name": quantum_app.name,
            "description": quantum_app.description,
            "type": quantum_app.type,
            "status": quantum_app.status,
            "visibility": quantum_app.visibility,
            "developer_id": quantum_app.developer_id,
            "latest_version_id": quantum_app.latest_version_id,
            "api_url": quantum_app.api_url,
            "documentation_url": quantum_app.documentation_url,
            "license_type": quantum_app.license_type,
            "license_url": quantum_app.license_url,
            "readme_content": quantum_app.readme_content,
            "repository_url": quantum_app.repository_url,
            "created_at": quantum_app.created_at,
            "updated_at": quantum_app.updated_at
        }

        return create_response(
            data=app_dict,
            message="Quantum app package uploaded successfully"
        )
    except Exception as e:
        raise_http_exception(
            message=f"Failed to upload package: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
