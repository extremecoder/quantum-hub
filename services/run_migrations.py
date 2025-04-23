"""
Run database migrations for Quantum Hub.

This script runs the Alembic migrations to set up the database schema.
"""
import os
import sys
import subprocess
from pathlib import Path

# Important: Add the parent directory to sys.path so modules can be found
project_root = Path('/Users/atamrak1/dev/rnd/fresh/quantum-hub')
sys.path.insert(0, str(project_root))

# Set the database connection parameters for Docker PostgreSQL instance
os.environ["POSTGRES_HOST"] = "localhost"
os.environ["POSTGRES_PORT"] = "5433"  # Docker PostgreSQL is running on port 5433
os.environ["POSTGRES_USER"] = "quantum_user"
os.environ["POSTGRES_PASSWORD"] = "quantum_password" 
os.environ["POSTGRES_DB"] = "quantum_hub"
os.environ["PYTHONPATH"] = str(project_root)

# Get the absolute path to the migrations directory
migrations_dir = Path('/Users/atamrak1/dev/rnd/fresh/quantum-hub/services/shared/database/migrations')

def run_migrations():
    """Run Alembic migrations."""
    try:
        # Change to the migrations directory
        os.chdir(migrations_dir)
        
        print(f"Working directory: {os.getcwd()}")
        
        # Check if alembic.ini exists
        if not os.path.exists('alembic.ini'):
            print(f"Error: alembic.ini not found in {migrations_dir}")
            return False
        
        # Set environment variable for Alembic
        env = os.environ.copy()
        
        # Run the migrations
        print("Running migrations...")
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            check=False,
            env=env
        )
        
        # Print the output
        print("STDOUT:", result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        # Check if the command was successful
        if result.returncode == 0:
            print("Migrations completed successfully")
            return True
        else:
            print(f"Migrations failed with exit code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"Error running migrations: {e}")
        return False

if __name__ == "__main__":
    run_migrations()
