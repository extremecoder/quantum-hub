"""
Script to run database migrations in the Docker environment.

This script executes Alembic migrations inside the PostgreSQL Docker container
to create all required database tables.
"""
import os
import subprocess
import time

def run_migrations_in_container():
    """Run Alembic migrations in the PostgreSQL Docker container."""
    print("Running database migrations in Docker environment...")
    
    # Get the container ID
    container_id_cmd = "docker ps | grep postgres | awk '{print $1}'"
    container_id = subprocess.check_output(container_id_cmd, shell=True).decode().strip()
    
    if not container_id:
        print("❌ PostgreSQL container not found")
        return False
    
    print(f"Found PostgreSQL container: {container_id}")
    
    # Execute migrations using alembic in the container context
    # We'll need to create a temporary script to run inside the container
    migration_script = """
    cd /app/services/shared/database/migrations && 
    POSTGRES_HOST=postgres 
    POSTGRES_PORT=5432 
    POSTGRES_USER=quantum_user 
    POSTGRES_PASSWORD=quantum_password 
    POSTGRES_DB=quantum_hub 
    alembic upgrade head
    """
    
    # Copy Alembic files to container first
    print("Copying migration files to container...")
    copy_cmd = f"docker cp /Users/atamrak1/dev/rnd/fresh/quantum-hub/services/shared/database/migrations {container_id}:/migrations"
    subprocess.run(copy_cmd, shell=True, check=True)
    
    # Write a script to execute inside the container
    with open("/tmp/run_migrations.sh", "w") as f:
        f.write(migration_script)
    
    print("Copying migration script to container...")
    copy_script_cmd = f"docker cp /tmp/run_migrations.sh {container_id}:/run_migrations.sh"
    subprocess.run(copy_script_cmd, shell=True, check=True)

    # Run the script in the container
    print("Executing migrations...")
    exec_cmd = f"docker exec {container_id} bash /run_migrations.sh"
    result = subprocess.run(exec_cmd, shell=True, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Migrations executed successfully")
        print(result.stdout)
        return True
    else:
        print(f"❌ Migration failed with error: {result.stderr}")
        return False

if __name__ == "__main__":
    run_migrations_in_container()
