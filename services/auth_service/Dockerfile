FROM python:3.11-slim

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY services/auth_service/requirements.txt .
COPY services/requirements.txt shared_requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt -r shared_requirements.txt

# Copy service code
COPY services/shared /app/services/shared
COPY services/auth_service /app/services/auth_service

# Set Python path to include shared modules
ENV PYTHONPATH=/app

# Service-specific environment variables
ENV SERVICE_NAME=auth_service
ENV MODULE_NAME=services.auth_service.app.main

# Run the service
CMD ["uvicorn", "services.auth_service.app.main:app", "--host", "0.0.0.0", "--port", "8000"]