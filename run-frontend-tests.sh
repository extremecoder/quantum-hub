#!/bin/bash

# Make sure the Auth Service is running
echo "Checking if Auth Service is running..."
if ! curl -s http://localhost:8001/api/v1/health > /dev/null; then
  echo "Auth Service is not running. Starting it..."
  cd ..
  docker-compose -f docker-compose.test.yml up -d auth_service
  cd frontend

  # Wait for the service to be ready
  echo "Waiting for Auth Service to be ready..."
  while ! curl -s http://localhost:8001/api/v1/health > /dev/null; do
    sleep 1
  done
  echo "Auth Service is ready!"
else
  echo "Auth Service is already running."
fi

# Run the Playwright tests
echo "Running Playwright tests..."
npx playwright test --config=./playwright.config.ts

# Open the report
echo "Opening test report..."
npx playwright show-report --config=./playwright.config.ts
