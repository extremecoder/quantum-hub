FROM codercom/code-server:latest

# Switch to root for installation tasks
USER root

# Install Python 3 and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    git \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set up a virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Create directories for workspace and templates
RUN mkdir -p /workspace /templates /app

# Copy application files
COPY ./src /app
COPY ./templates /templates

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set environment variables for code-server
ENV VSCODE_HOST=0.0.0.0
ENV VSCODE_PORT=8080
ENV WORKSPACE_DIR=/workspace
ENV TEMPLATE_DIR=/templates

# Set proper ownership
RUN chown -R coder:coder /workspace /templates /app /opt/venv /entrypoint.sh

# Expose ports for FastAPI and code-server
EXPOSE 8000 8080

# Set the working directory
WORKDIR /app

# Switch back to the coder user
USER coder

# Run the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
