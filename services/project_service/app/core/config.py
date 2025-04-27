"""
Configuration settings for the Project Service.

This module provides configuration settings for the Project Service,
including environment variables, database connection, and security settings.
"""
import os
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, BaseSettings, PostgresDsn, validator


class Settings(BaseSettings):
    """Settings for the Project Service."""
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Quantum Hub Project Service"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Security settings
    SECRET_KEY: str = "5b0c1d6c5fafa8d4224ede60d504bf91e7a8d245cd290d33de52c55d"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database settings
    DATABASE_URL: Optional[PostgresDsn] = None
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        """Pydantic config."""
        case_sensitive = True
        env_file = ".env"


# Create settings instance
settings = Settings()
