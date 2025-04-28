"""
Tests for the package utilities.

This module provides tests for the package utilities used by the Quantum App Service.
"""
import io
import json
import zipfile
import pytest

from services.shared.utils.package import (
    extract_manifest_from_zip, validate_manifest, extract_qasm_files, validate_package
)


def create_test_zip(manifest_data=None, qasm_files=None):
    """Create a test zip file with manifest and QASM files."""
    # Create a BytesIO object to hold the zip file
    zip_buffer = io.BytesIO()
    
    # Create a zip file
    with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
        # Add manifest if provided
        if manifest_data:
            manifest_json = json.dumps(manifest_data)
            zip_file.writestr('quantum_manifest.json', manifest_json)
        
        # Add QASM files if provided
        if qasm_files:
            for filename, content in qasm_files.items():
                zip_file.writestr(filename, content)
    
    # Get the binary data
    zip_buffer.seek(0)
    return zip_buffer.getvalue()


def test_extract_manifest_from_zip():
    """Test extracting manifest from a zip file."""
    # Create test data
    manifest_data = {
        "name": "Test App",
        "type": "CIRCUIT",
        "version_number": "1.0.0",
        "sdk_used": "QISKIT"
    }
    
    # Create test zip
    zip_data = create_test_zip(manifest_data=manifest_data)
    
    # Extract manifest
    extracted_manifest = extract_manifest_from_zip(zip_data)
    
    # Check result
    assert extracted_manifest == manifest_data


def test_extract_manifest_from_zip_no_manifest():
    """Test extracting manifest from a zip file with no manifest."""
    # Create test zip with no manifest
    zip_data = create_test_zip(qasm_files={"test.qasm": "OPENQASM 2.0;"})
    
    # Extract manifest
    extracted_manifest = extract_manifest_from_zip(zip_data)
    
    # Check result
    assert extracted_manifest is None


def test_extract_manifest_from_zip_invalid_zip():
    """Test extracting manifest from an invalid zip file."""
    # Create invalid zip data
    invalid_zip_data = b"This is not a zip file"
    
    # Extract manifest
    with pytest.raises(ValueError, match="Invalid zip file"):
        extract_manifest_from_zip(invalid_zip_data)


def test_validate_manifest_valid():
    """Test validating a valid manifest."""
    # Create valid manifest
    manifest = {
        "name": "Test App",
        "type": "CIRCUIT",
        "version_number": "1.0.0",
        "sdk_used": "QISKIT"
    }
    
    # Validate manifest
    is_valid, errors = validate_manifest(manifest)
    
    # Check result
    assert is_valid
    assert len(errors) == 0


def test_validate_manifest_missing_fields():
    """Test validating a manifest with missing fields."""
    # Create invalid manifest
    manifest = {
        "name": "Test App",
        "type": "CIRCUIT"
    }
    
    # Validate manifest
    is_valid, errors = validate_manifest(manifest)
    
    # Check result
    assert not is_valid
    assert len(errors) > 0
    assert "Missing required field: version_number" in errors
    assert "Missing required field: sdk_used" in errors


def test_extract_qasm_files():
    """Test extracting QASM files from a zip file."""
    # Create test data
    qasm_files = {
        "test1.qasm": "OPENQASM 2.0;",
        "test2.qasm": "OPENQASM 2.0; include \"qelib1.inc\";",
        "not_qasm.txt": "This is not a QASM file"
    }
    
    # Create test zip
    zip_data = create_test_zip(qasm_files=qasm_files)
    
    # Extract QASM files
    extracted_files = extract_qasm_files(zip_data)
    
    # Check result
    assert len(extracted_files) == 2
    assert "test1.qasm" in extracted_files
    assert "test2.qasm" in extracted_files
    assert "not_qasm.txt" not in extracted_files
    assert extracted_files["test1.qasm"] == "OPENQASM 2.0;"
    assert extracted_files["test2.qasm"] == "OPENQASM 2.0; include \"qelib1.inc\";"


def test_validate_package_valid():
    """Test validating a valid package."""
    # Create test data
    manifest_data = {
        "name": "Test App",
        "type": "CIRCUIT",
        "version_number": "1.0.0",
        "sdk_used": "QISKIT",
        "qasm_files": ["test.qasm"]
    }
    qasm_files = {
        "test.qasm": "OPENQASM 2.0;"
    }
    
    # Create test zip
    zip_data = create_test_zip(manifest_data=manifest_data, qasm_files=qasm_files)
    
    # Validate package
    is_valid, errors, manifest = validate_package(zip_data)
    
    # Check result
    assert is_valid
    assert len(errors) == 0
    assert manifest == manifest_data


def test_validate_package_missing_manifest():
    """Test validating a package with no manifest."""
    # Create test zip with no manifest
    zip_data = create_test_zip(qasm_files={"test.qasm": "OPENQASM 2.0;"})
    
    # Validate package
    is_valid, errors, manifest = validate_package(zip_data)
    
    # Check result
    assert not is_valid
    assert "Missing quantum_manifest.json in package" in errors
    assert manifest is None


def test_validate_package_no_qasm_files():
    """Test validating a package with no QASM files."""
    # Create test data
    manifest_data = {
        "name": "Test App",
        "type": "CIRCUIT",
        "version_number": "1.0.0",
        "sdk_used": "QISKIT"
    }
    
    # Create test zip with no QASM files
    zip_data = create_test_zip(manifest_data=manifest_data)
    
    # Validate package
    is_valid, errors, manifest = validate_package(zip_data)
    
    # Check result
    assert not is_valid
    assert "No .qasm files found in package" in errors
    assert manifest == manifest_data
