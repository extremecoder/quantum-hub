"""
Service functions for quantum applications.

This module provides functions for managing quantum applications and their versions.
"""
from typing import Dict, List, Optional, Tuple, Any
from uuid import UUID

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from services.shared.database.models import QuantumApp, AppVersion, User
from services.shared.utils.package import extract_manifest_from_zip, validate_package


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


async def get_quantum_apps(db: AsyncSession, user_id: Optional[UUID] = None) -> List[QuantumApp]:
    """
    Get all quantum apps, optionally filtered by user ID.

    Args:
        db: Database session.
        user_id: Optional user ID to filter by.

    Returns:
        List[QuantumApp]: List of quantum apps.
    """
    query = select(QuantumApp)

    if user_id:
        query = query.where(QuantumApp.developer_id == user_id)

    result = await db.execute(query)
    return result.scalars().all()


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


async def create_quantum_app(
    db: AsyncSession, user_id: UUID, app_data: Dict[str, Any]
) -> QuantumApp:
    """
    Create a new quantum app.

    Args:
        db: Database session.
        user_id: User ID.
        app_data: Quantum app creation data.

    Returns:
        QuantumApp: The created quantum app.
    """
    # Create the quantum app
    quantum_app = QuantumApp(
        developer_id=user_id,
        name=app_data["name"],
        description=app_data.get("description"),
        type=app_data["type"],
        status=["DRAFT"],
        visibility=app_data.get("visibility", "PRIVATE"),
        api_url=app_data.get("api_url"),
        documentation_url=app_data.get("documentation_url"),
        license_type=app_data.get("license_type"),
        license_url=app_data.get("license_url"),
        readme_content=app_data.get("readme_content"),
        repository_url=app_data.get("repository_url")
    )

    # Save to database
    db.add(quantum_app)
    await db.commit()
    await db.refresh(quantum_app)

    return quantum_app


async def update_quantum_app(
    db: AsyncSession, app_id: UUID, user_id: UUID, app_data: Dict[str, Any]
) -> Optional[QuantumApp]:
    """
    Update a quantum app.

    Args:
        db: Database session.
        app_id: Quantum app ID.
        user_id: User ID.
        app_data: Quantum app update data.

    Returns:
        Optional[QuantumApp]: The updated quantum app if found, None otherwise.
    """
    # Check if quantum app exists and belongs to the user
    quantum_app = await get_quantum_app(db, app_id)
    if not quantum_app or quantum_app.developer_id != user_id:
        return None

    # Update fields
    update_data = {k: v for k, v in app_data.items() if v is not None}

    if update_data:
        await db.execute(
            update(QuantumApp)
            .where(QuantumApp.id == app_id)
            .values(**update_data)
        )
        await db.commit()
        await db.refresh(quantum_app)

    return quantum_app


async def delete_quantum_app(
    db: AsyncSession, app_id: UUID, user_id: UUID
) -> bool:
    """
    Delete a quantum app.

    Args:
        db: Database session.
        app_id: Quantum app ID.
        user_id: User ID.

    Returns:
        bool: True if the quantum app was deleted, False otherwise.
    """
    # Check if quantum app exists and belongs to the user
    quantum_app = await get_quantum_app(db, app_id)
    if not quantum_app or quantum_app.developer_id != user_id:
        return False

    # Delete the quantum app
    await db.execute(
        delete(QuantumApp)
        .where(QuantumApp.id == app_id)
    )
    await db.commit()

    return True


async def get_app_versions(
    db: AsyncSession, app_id: UUID
) -> List[AppVersion]:
    """
    Get all versions of a quantum app.

    Args:
        db: Database session.
        app_id: Quantum app ID.

    Returns:
        List[AppVersion]: List of app versions.
    """
    result = await db.execute(
        select(AppVersion)
        .where(AppVersion.quantum_app_id == app_id)
        .order_by(AppVersion.created_at.desc())
    )
    return result.scalars().all()


async def get_app_version(
    db: AsyncSession, version_id: UUID
) -> Optional[AppVersion]:
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


async def create_app_version(
    db: AsyncSession, app_id: UUID, version_data: Dict[str, Any], package_data: Optional[bytes] = None
) -> Optional[AppVersion]:
    """
    Create a new app version.

    Args:
        db: Database session.
        app_id: Quantum app ID.
        version_data: App version creation data.
        package_data: Optional binary package data.

    Returns:
        Optional[AppVersion]: The created app version if successful, None otherwise.
    """
    # Check if quantum app exists
    quantum_app = await get_quantum_app(db, app_id)
    if not quantum_app:
        return None

    # Create the app version
    app_version = AppVersion(
        quantum_app_id=app_id,
        version_number=version_data["version_number"],
        sdk_used=version_data["sdk_used"],
        input_schema=version_data.get("input_schema"),
        output_schema=version_data.get("output_schema"),
        preferred_platform=version_data.get("preferred_platform"),
        preferred_device_id=version_data.get("preferred_device_id"),
        number_of_qubits=version_data.get("number_of_qubits"),
        package_path=version_data.get("package_path"),
        package_data=package_data,
        source_repo=quantum_app.repository_url,
        is_latest=True,
        status="DRAFT",
        release_notes=version_data.get("release_notes")
    )

    # Save to database
    db.add(app_version)
    await db.commit()
    await db.refresh(app_version)

    # Update previous versions to not be latest
    await db.execute(
        update(AppVersion)
        .where(
            (AppVersion.quantum_app_id == app_id) &
            (AppVersion.id != app_version.id)
        )
        .values(is_latest=False)
    )
    await db.commit()

    # Update the quantum app with the latest version
    quantum_app.latest_version_id = app_version.id
    await db.commit()
    await db.refresh(quantum_app)

    return app_version


async def get_app_package(
    db: AsyncSession, version_id: UUID
) -> Optional[Tuple[bytes, str]]:
    """
    Get the package data for an app version.

    Args:
        db: Database session.
        version_id: Version ID.

    Returns:
        Optional[Tuple[bytes, str]]: Tuple of (package_data, filename) if found, None otherwise.
    """
    app_version = await get_app_version(db, version_id)
    if not app_version or not app_version.package_data:
        return None

    return (app_version.package_data, app_version.package_path or "package.zip")


async def upload_app_package(
    db: AsyncSession, user_id: UUID, package_data: bytes, filename: str
) -> Optional[QuantumApp]:
    """
    Upload a quantum app package.

    Args:
        db: Database session.
        user_id: User ID.
        package_data: Binary package data.
        filename: Name of the uploaded file.

    Returns:
        Optional[QuantumApp]: The created or updated quantum app if successful, None otherwise.
    """
    # Validate the package
    is_valid, errors, manifest = validate_package(package_data)
    if not is_valid or not manifest:
        raise ValueError(f"Invalid package: {', '.join(errors)}")

    # Check if the user exists
    user = await get_user_by_id(db, user_id)
    if not user:
        raise ValueError("User not found")

    # Get the normalized manifest
    normalized = manifest.get("_normalized", {})

    # Extract app data from manifest
    app_type = normalized.get("type") or manifest.get("application_type")

    # Import the enums
    from services.shared.database.enums import AppType, AppVisibility, LicenseType

    # Convert the app_type string to the corresponding enum value
    app_type = app_type.lower() if app_type else "other"

    # Get visibility
    visibility = manifest.get("visibility", "private")
    visibility = visibility.lower() if visibility else "private"

    # Get license type
    license_type = manifest.get("license", "mit")
    license_type = license_type.lower() if license_type else "mit"

    app_data = {
        "name": normalized.get("name") or manifest.get("app_name"),
        "description": normalized.get("description") or manifest.get("app_description"),
        "type": app_type,
        "visibility": visibility,
        "api_url": manifest.get("api_url"),
        "documentation_url": manifest.get("documentation_url"),
        "license_type": license_type,
        "license_url": manifest.get("license_url"),
        "readme_content": manifest.get("readme"),
        "repository_url": manifest.get("repository_url")
    }

    # Import SDKType enum if not already imported
    from services.shared.database.enums import SDKType

    # Get SDK type
    sdk_used = normalized.get("sdk_used") or manifest.get("quantum_cli_sdk_version", "quantum_cli")
    sdk_used = sdk_used.lower() if sdk_used else "quantum_cli"

    # Extract version data from manifest
    version_data = {
        "version_number": normalized.get("version_number") or manifest.get("version"),
        "sdk_used": sdk_used,
        "input_schema": manifest.get("input"),
        "output_schema": manifest.get("expected_output"),
        "preferred_platform": manifest.get("preferred_hardware"),
        "preferred_device_id": None,  # Not directly available in the sample manifest
        "number_of_qubits": None,  # Not directly available in the sample manifest
        "package_path": filename,
        "release_notes": None  # Not directly available in the sample manifest
    }

    # Check if app with this name already exists for this user
    existing_apps = await get_quantum_apps(db, user_id)
    existing_app = next((app for app in existing_apps if app.name == app_data["name"]), None)

    if existing_app:
        # Update existing app
        quantum_app = await update_quantum_app(db, existing_app.id, user_id, app_data)

        # Create new version
        await create_app_version(db, quantum_app.id, version_data, package_data)
    else:
        # Create new app
        quantum_app = await create_quantum_app(db, user_id, app_data)

        # Create new version
        await create_app_version(db, quantum_app.id, version_data, package_data)

    # Refresh quantum app to get latest data
    await db.refresh(quantum_app)

    return quantum_app
