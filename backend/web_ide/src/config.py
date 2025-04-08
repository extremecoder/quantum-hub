"""
Configuration settings for the Web IDE service.
"""

import os
from pydantic import BaseSettings


class Settings(BaseSettings):
    """Settings for the Web IDE service."""
    
    # API settings
    API_VERSION: str = "v1"
    API_PREFIX: str = f"/api/{API_VERSION}"
    
    # Server settings
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # OpenVSCode Server settings
    VSCODE_HOST: str = os.getenv("VSCODE_HOST", "localhost")
    VSCODE_PORT: int = int(os.getenv("VSCODE_PORT", "3000"))
    
    # Security settings
    CORS_ORIGINS: list = [
        "http://localhost:3000",  # Frontend
        "http://localhost:8000",  # Backend
    ]
    
    # Workspace settings
    WORKSPACE_DIR: str = os.getenv("WORKSPACE_DIR", "/workspace")
    TEMPLATE_DIR: str = os.getenv("TEMPLATE_DIR", "/templates")
    
    # GitHub settings
    GITHUB_API_URL: str = "https://api.github.com"
    
    class Config:
        env_file = ".env"


settings = Settings()
