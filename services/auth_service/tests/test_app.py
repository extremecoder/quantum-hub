"""
Basic tests for the Auth Service application.

This module provides basic tests for the Auth Service application.
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from services.auth_service.app.main import app


def test_app_instance():
    """Test that the app instance is a FastAPI instance."""
    assert isinstance(app, FastAPI)
    assert app.title == "Quantum Hub Auth Service"


def test_app_routes():
    """Test that the app has the expected routes."""
    routes = [route.path for route in app.routes]
    assert "/health" in routes
    assert "/api/v1/health" in routes
    assert "/api/v1/docs" in routes
    assert "/api/v1/openapi.json" in routes
