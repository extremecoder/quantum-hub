#!/bin/bash

# Initialize the test database
echo "Initializing test database..."
python tests/init_test_db.py

# Run the tests
echo "Running tests..."
python -m pytest tests/ -v
