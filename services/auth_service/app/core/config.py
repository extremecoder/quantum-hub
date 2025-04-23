"""
Configuration settings for the Auth Service.

This module loads configuration from environment variables with secure defaults
and provides typed settings using Pydantic.
"""
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings with environment variable support and validation.
    
    Environment variables will be loaded from .env file or system environment.
    """
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Quantum Hub Auth Service"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
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
    
    # Email verification settings
    EMAILS_ENABLED: bool = False
    EMAIL_TEMPLATES_DIR: str = "app/email-templates"
    EMAILS_FROM_NAME: str = "Quantum Hub"
    EMAILS_FROM_EMAIL: str = "noreply@quantumhub.example.com"
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # OAuth settings
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = "http://localhost:8001/api/v1/auth/google/callback"
    
    class Config:
        """Pydantic config."""
        case_sensitive = True
        env_file = ".env"


# Create global settings instance
settings = Settings()
