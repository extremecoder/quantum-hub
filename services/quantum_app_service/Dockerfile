FROM python:3.11-slim

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY services/quantum_app_service/requirements.txt .
COPY services/requirements.txt shared_requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt -r shared_requirements.txt

# Copy service code
COPY services/shared /app/services/shared
COPY services/quantum_app_service /app/services/quantum_app_service

# Set Python path to include shared modules
ENV PYTHONPATH=/app

# Service-specific environment variables
ENV SERVICE_NAME=quantum_app_service
ENV MODULE_NAME=services.quantum_app_service.app.main

# Expose the service port
EXPOSE 8003

# Run the service
CMD ["uvicorn", "services.quantum_app_service.app.main:app", "--host", "0.0.0.0", "--port", "8003"]
