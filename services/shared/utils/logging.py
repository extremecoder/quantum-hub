"""
Logging configuration utilities.

This module provides functions and configurations for consistent logging
across all Quantum Hub services.
"""
import logging
import sys
from typing import Dict, Optional, Union
import uuid

# Default log format with service name, level, timestamp and request ID
DEFAULT_FORMAT = "%(asctime)s | %(levelname)s | %(service)s | %(request_id)s | %(name)s | %(message)s"


class ServiceLogger(logging.Logger):
    """
    Extended Logger class that includes service name and request ID.

    This custom logger ensures all log messages include the service name
    and a request ID for traceability across distributed systems.
    """

    def __init__(
        self,
        name: str,
        service_name: str,
        level: Union[int, str] = logging.INFO
    ):
        """
        Initialize the service logger.

        Args:
            name: The logger name
            service_name: The service name (e.g., "auth_service")
            level: The logging level (default: INFO)
        """
        super().__init__(name, level)
        self.service_name = service_name
        self._request_id = None


def configure_logging(
    service_name: str,
    level: Union[int, str] = logging.INFO,
    log_format: str = DEFAULT_FORMAT,
    log_file: Optional[str] = None
) -> None:
    """
    Configure the logging system for a service.

    Args:
        service_name: The name of the service for logging
        level: The logging level (default: INFO)
        log_format: The log format string
        log_file: Optional path to log file (logs to stdout if None)
    """
    # Use the standard Logger class for testing
    # logging.setLoggerClass(ServiceLogger)

    # Create a filter that adds service and request ID to all records
    class ContextFilter(logging.Filter):
        def filter(self, record):
            if not hasattr(record, 'service'):
                record.service = service_name
            if not hasattr(record, 'request_id'):
                record.request_id = "no_request"
            return True

    # Configure the root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Remove any existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Create formatter
    formatter = logging.Formatter(log_format)

    # Create and add handlers
    handlers = []

    # Always add console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    handlers.append(console_handler)

    # Add file handler if specified
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)

    # Add all handlers and filter to the root logger
    for handler in handlers:
        handler.addFilter(ContextFilter())
        root_logger.addHandler(handler)

    # Create a specific logger for the service
    logger = logging.getLogger(service_name)

    # Log the configuration
    logger.info(
        f"Logging configured for service: {service_name}, "
        f"level: {logging.getLevelName(level)}"
    )


def get_logger(name: str, service_name: str) -> logging.Logger:
    """
    Get a configured logger for a specific module.

    Args:
        name: The logger name (typically __name__)
        service_name: The service name

    Returns:
        logging.Logger: A configured logger instance
    """
    logger = logging.getLogger(name)

    # Set service name if logger is our custom ServiceLogger
    if isinstance(logger, ServiceLogger):
        logger.service_name = service_name

    return logger


def set_request_id(request_id: Optional[str] = None) -> str:
    """
    Set a request ID for the current context.

    Args:
        request_id: An optional request ID. Generates a UUID if not provided.

    Returns:
        str: The request ID that was set
    """
    if request_id is None:
        request_id = str(uuid.uuid4())

    # Create a filter that adds the request ID
    class RequestIdFilter(logging.Filter):
        def filter(self, record):
            record.request_id = request_id
            return True

    # Apply to all handlers
    for handler in logging.getLogger().handlers:
        # Remove any existing RequestIdFilter
        for f in handler.filters:
            if isinstance(f, RequestIdFilter):
                handler.removeFilter(f)

        # Add new filter
        handler.addFilter(RequestIdFilter())

    return request_id
