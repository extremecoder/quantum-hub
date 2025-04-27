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

# Make sure the frontend is running
echo "Checking if frontend is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "Frontend is not running. Starting it in a new terminal..."
  # Start the frontend in a new terminal
  osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && npm run dev"'
  
  # Wait for the frontend to be ready
  echo "Waiting for frontend to be ready..."
  while ! curl -s http://localhost:3000 > /dev/null; do
    sleep 1
  done
  echo "Frontend is ready!"
else
  echo "Frontend is already running."
fi

# Run the Puppeteer test
echo "Running Puppeteer test..."
node auth-flow-test.js
