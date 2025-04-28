"""
Package handling utilities for quantum applications.

This module provides functions for processing quantum application packages,
including zip file extraction and manifest parsing.
"""
import io
import json
import zipfile
from typing import Dict, List, Optional, Tuple, Any


def extract_manifest_from_zip(package_data: bytes) -> Optional[Dict[str, Any]]:
    """
    Extract and parse the quantum_manifest.json file from a zip package.

    Args:
        package_data: Binary data of the zip package.

    Returns:
        Optional[Dict[str, Any]]: The parsed manifest as a dictionary, or None if not found.

    Raises:
        ValueError: If the zip file is invalid or the manifest is not valid JSON.
    """
    try:
        # Create a BytesIO object from the binary data
        zip_buffer = io.BytesIO(package_data)

        # Open the zip file
        with zipfile.ZipFile(zip_buffer, 'r') as zip_file:
            # Check if the manifest file exists
            if 'quantum_manifest.json' not in zip_file.namelist():
                return None

            # Extract the manifest file
            manifest_data = zip_file.read('quantum_manifest.json')

            # Parse the manifest as JSON
            return json.loads(manifest_data)
    except zipfile.BadZipFile:
        raise ValueError("Invalid zip file")
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON in quantum_manifest.json")


def validate_manifest(manifest: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate the structure and content of a quantum manifest.

    Args:
        manifest: The manifest dictionary to validate.

    Returns:
        Tuple[bool, List[str]]: A tuple containing:
            - bool: True if valid, False otherwise
            - List[str]: List of validation error messages (empty if valid)
    """
    errors = []

    # Map manifest fields to our expected fields
    field_mapping = {
        'app_name': 'name',
        'version': 'version_number',
        'application_type': 'type',
        'quantum_cli_sdk_version': 'sdk_used',
        'app_description': 'description'
    }

    # Create a normalized manifest with our expected field names
    normalized_manifest = {}
    for source_field, target_field in field_mapping.items():
        if source_field in manifest:
            normalized_manifest[target_field] = manifest[source_field]

    # Add the normalized manifest back to the original for later use
    manifest['_normalized'] = normalized_manifest

    # Check required fields in the normalized manifest
    required_fields = ['name', 'type', 'version_number', 'sdk_used']
    for field in required_fields:
        if field not in normalized_manifest:
            original_field = next((k for k, v in field_mapping.items() if v == field), field)
            errors.append(f"Missing required field: {original_field}")

    # Validate field types if they exist
    if 'name' in normalized_manifest and not isinstance(normalized_manifest['name'], str):
        errors.append("Field 'app_name' must be a string")

    if 'type' in normalized_manifest and not isinstance(normalized_manifest['type'], str):
        errors.append("Field 'application_type' must be a string")

    if 'version_number' in normalized_manifest and not isinstance(normalized_manifest['version_number'], str):
        errors.append("Field 'version' must be a string")

    if 'sdk_used' in normalized_manifest and not isinstance(normalized_manifest['sdk_used'], str):
        errors.append("Field 'quantum_cli_sdk_version' must be a string")

    # Check for application_source_file (QASM file)
    if 'application_source_file' not in manifest:
        errors.append("Missing required field: application_source_file")
    elif not isinstance(manifest['application_source_file'], str):
        errors.append("Field 'application_source_file' must be a string")
    else:
        # Add the source file to a qasm_files list for later validation
        manifest['qasm_files'] = [manifest['application_source_file']]

    # Return validation result
    return len(errors) == 0, errors


def extract_qasm_files(package_data: bytes) -> Dict[str, str]:
    """
    Extract all .qasm files from a zip package.

    Args:
        package_data: Binary data of the zip package.

    Returns:
        Dict[str, str]: Dictionary mapping filenames to file contents.

    Raises:
        ValueError: If the zip file is invalid.
    """
    qasm_files = {}

    try:
        # Create a BytesIO object from the binary data
        zip_buffer = io.BytesIO(package_data)

        # Open the zip file
        with zipfile.ZipFile(zip_buffer, 'r') as zip_file:
            # Get all .qasm files
            for file_info in zip_file.infolist():
                if file_info.filename.endswith('.qasm'):
                    # Extract the file content
                    content = zip_file.read(file_info.filename)
                    qasm_files[file_info.filename] = content.decode('utf-8')

        return qasm_files
    except zipfile.BadZipFile:
        raise ValueError("Invalid zip file")
    except UnicodeDecodeError:
        raise ValueError("Unable to decode .qasm file as UTF-8")


def validate_package(package_data: bytes) -> Tuple[bool, List[str], Optional[Dict[str, Any]]]:
    """
    Validate a quantum application package.

    Args:
        package_data: Binary data of the zip package.

    Returns:
        Tuple[bool, List[str], Optional[Dict[str, Any]]]: A tuple containing:
            - bool: True if valid, False otherwise
            - List[str]: List of validation error messages (empty if valid)
            - Optional[Dict[str, Any]]: The parsed manifest if valid, None otherwise
    """
    errors = []
    manifest = None

    try:
        # Extract the manifest
        manifest = extract_manifest_from_zip(package_data)
        if not manifest:
            errors.append("Missing quantum_manifest.json in package")
            return False, errors, None

        # Validate the manifest
        is_valid, manifest_errors = validate_manifest(manifest)
        if not is_valid:
            errors.extend(manifest_errors)

        # Extract and check for .qasm files
        qasm_files = extract_qasm_files(package_data)
        if not qasm_files:
            errors.append("No .qasm files found in package")

        # If manifest specifies qasm_files, check they exist
        if manifest and 'qasm_files' in manifest:
            for qasm_file in manifest['qasm_files']:
                if qasm_file not in qasm_files:
                    errors.append(f"Specified QASM file not found in package: {qasm_file}")

        # Return validation result
        return len(errors) == 0, errors, manifest
    except ValueError as e:
        errors.append(str(e))
        return False, errors, None
