"""
Tests for the sample files.

This module provides tests for the sample files provided in the sample folder.
"""
import os
import pytest
from services.shared.utils.package import validate_package


def test_sample_zip_file():
    """Test validating the sample zip file."""
    # Get the path to the sample zip file
    sample_dir = os.path.join(os.getcwd(), "sample")
    zip_file_path = os.path.join(sample_dir, "one-2.0.0.zip")
    
    # Read the zip file
    with open(zip_file_path, "rb") as f:
        package_data = f.read()
    
    # Validate the package
    is_valid, errors, manifest = validate_package(package_data)
    
    # Check result
    assert is_valid, f"Package validation failed: {errors}"
    assert manifest is not None
    
    # Check normalized manifest
    normalized = manifest.get("_normalized", {})
    assert "name" in normalized
    assert "version_number" in normalized
    assert "type" in normalized
    assert "sdk_used" in normalized
    
    # Check original fields
    assert manifest["app_name"] == "one"
    assert manifest["version"] == "2.0.0"
    assert manifest["application_type"] == "circuit"
    assert manifest["quantum_cli_sdk_version"] == "latest"
    
    # Check that QASM files were found
    assert "qasm_files" in manifest
    assert isinstance(manifest["qasm_files"], list)
    assert "one.qasm" in manifest["qasm_files"]
