"""
Shared utilities package for Quantum Hub services.

This package contains utility modules shared across all services, including:
- Password hashing and verification
- JWT token handling
- API response formatting
- Logging configuration
"""

from .api import (
    BaseResponse, PaginatedResponse, ErrorResponse, PaginationMeta,
    create_response, create_error_response, raise_http_exception
)
from .jwt import (
    create_access_token, decode_token, get_token_subject
)
from .logging import (
    configure_logging, get_logger, set_request_id
)
from .password import (
    hash_password, verify_password
)

__all__ = [
    # API utilities
    "BaseResponse", "PaginatedResponse", "ErrorResponse", "PaginationMeta",
    "create_response", "create_error_response", "raise_http_exception",
    
    # JWT utilities
    "create_access_token", "decode_token", "get_token_subject",
    
    # Logging utilities
    "configure_logging", "get_logger", "set_request_id",
    
    # Password utilities
    "hash_password", "verify_password",
]