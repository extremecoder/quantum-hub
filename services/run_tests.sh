#!/bin/bash

# Set environment variables for testing
export TESTING=true
export MONGO_URL="mongodb://localhost:27017"
export SECRET_KEY="test_secret_key_for_testing_purposes_only"

# Get absolute path to the directories
SERVICES_DIR="$(cd "$(dirname "$0")" && pwd)"
QUANTUM_HUB_DIR="$(cd "$SERVICES_DIR/.." && pwd)"
REPO_ROOT="$(cd "$QUANTUM_HUB_DIR/.." && pwd)"

# Since tests are expecting imports from 'quantum_hub', we need to symlink if it doesn't exist
QUANTUM_HUB_MODULE_PATH="$REPO_ROOT/quantum_hub"
if [ ! -e "$QUANTUM_HUB_MODULE_PATH" ]; then
  echo "Creating symlink for quantum_hub module"
  ln -sf "$QUANTUM_HUB_DIR" "$QUANTUM_HUB_MODULE_PATH"
fi

# Set PYTHONPATH to include the repository root
export PYTHONPATH="$REPO_ROOT:$PYTHONPATH"

# Run tests with coverage report from the services directory
cd "$SERVICES_DIR"
python -m pytest . -v --cov=. --cov-report=term-missing

# Exit with the same status as pytest
exit $? 