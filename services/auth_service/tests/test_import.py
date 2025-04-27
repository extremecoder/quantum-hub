"""
Import test for the Auth Service.

This module tests that the Auth Service modules can be imported.
"""
import pytest


def test_import_main():
    """Test that the main module can be imported."""
    from services.auth_service.app.main import app
    assert app is not None


def test_import_models():
    """Test that the models module can be imported."""
    from services.auth_service.app.models import database, schemas
    assert database is not None
    assert schemas is not None


def test_import_repositories():
    """Test that the repositories module can be imported."""
    from services.auth_service.app.repositories import user, api_key, token
    assert user is not None
    assert api_key is not None
    assert token is not None
