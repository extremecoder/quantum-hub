"""
Script to verify the API documentation.

This script runs the Auth Service and Project Service and opens the Swagger UI
in a browser for manual testing.
"""
import subprocess
import time
import webbrowser
import sys
import os
import signal
import argparse

# Parse command line arguments
parser = argparse.ArgumentParser(description="Verify API documentation")
parser.add_argument("--service", choices=["auth", "project", "both"], default="both", help="Service to verify")
args = parser.parse_args()

# Define service ports
AUTH_PORT = 8001
PROJECT_PORT = 8002

# Define service commands
auth_command = ["uvicorn", "services.auth_service.app.main:app", "--host", "0.0.0.0", "--port", str(AUTH_PORT)]
project_command = ["uvicorn", "services.project_service.app.main:app", "--host", "0.0.0.0", "--port", str(PROJECT_PORT)]

# Start services
processes = []

try:
    if args.service in ["auth", "both"]:
        print(f"Starting Auth Service on port {AUTH_PORT}...")
        auth_process = subprocess.Popen(auth_command)
        processes.append(auth_process)
        
    if args.service in ["project", "both"]:
        print(f"Starting Project Service on port {PROJECT_PORT}...")
        project_process = subprocess.Popen(project_command)
        processes.append(project_process)
    
    # Wait for services to start
    print("Waiting for services to start...")
    time.sleep(3)
    
    # Open browser
    if args.service in ["auth", "both"]:
        auth_url = f"http://localhost:{AUTH_PORT}/api/v1/docs"
        print(f"Opening Auth Service Swagger UI: {auth_url}")
        webbrowser.open(auth_url)
    
    if args.service in ["project", "both"]:
        project_url = f"http://localhost:{PROJECT_PORT}/api/v1/docs"
        print(f"Opening Project Service Swagger UI: {project_url}")
        webbrowser.open(project_url)
    
    print("\nPress Ctrl+C to stop the services...")
    
    # Keep the script running until interrupted
    while True:
        time.sleep(1)
        
except KeyboardInterrupt:
    print("\nStopping services...")
    
finally:
    # Stop services
    for process in processes:
        process.terminate()
        process.wait()
    
    print("Services stopped.")
