#!/bin/bash

set -e

# Activate virtual environment
source /opt/venv/bin/activate

# Set explicit port values to avoid conflicts
API_PORT=${PORT:-8000}
VSCODE_HOST=${VSCODE_HOST:-0.0.0.0}
VSCODE_PORT=${VSCODE_PORT:-8080}

echo "Starting Web IDE Management API on port ${API_PORT}..."
# Start FastAPI in the background
cd /app
uvicorn main:app --host ${HOST:-0.0.0.0} --port ${API_PORT} &
API_PID=$!

echo "Starting Code Server on port ${VSCODE_PORT}..."
# Start Code Server in the background
# Use the built-in code-server command with explicit arguments
/usr/bin/code-server \
  --auth none \
  --bind-addr ${VSCODE_HOST}:${VSCODE_PORT} \
  --disable-telemetry \
  --user-data-dir /home/coder/.local/share/code-server \
  --extensions-dir /home/coder/.local/share/code-server/extensions \
  ${WORKSPACE_DIR:-/workspace} &
VS_CODE_PID=$!

echo "Services started. API running on port ${API_PORT} (PID: $API_PID), VS Code running on port ${VSCODE_PORT} (PID: $VS_CODE_PID)"

# Handle signals properly
trap "echo 'Stopping services...'; kill $API_PID $VS_CODE_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Keep the container running
wait $API_PID $VS_CODE_PID
