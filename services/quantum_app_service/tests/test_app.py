"""
Basic tests for the Quantum App Service application.

This module provides basic tests for the Quantum App Service application.
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from services.quantum_app_service.app.main import app


def test_app_instance():
    """Test that the app instance is a FastAPI instance."""
    assert isinstance(app, FastAPI)
    assert app.title == "Quantum Hub Quantum App Service"


def test_app_routes():
    """Test that the app has the expected routes."""
    routes = [route.path for route in app.routes]
    assert "/health" in routes
    assert "/api/v1/docs" in routes
    assert "/api/v1/openapi.json" in routes


def test_health_check():
    """Test the health check endpoint."""
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "quantum_app_service"}
