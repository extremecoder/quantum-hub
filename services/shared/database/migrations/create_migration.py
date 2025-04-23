#!/usr/bin/env python
"""
Helper script to create database migrations.

This script uses Alembic to generate migration scripts based on the
differences between the models and the current database schema.
"""
import os
import sys
import argparse
from datetime import datetime
from pathlib import Path

# Adjust Python path to find the project modules
script_dir = Path(__file__).resolve().parent
project_root = script_dir.parent.parent.parent.parent
sys.path.append(str(project_root))

from alembic.config import Config
from alembic import command


def create_migration(message):
    """
    Create a new migration using Alembic's autogenerate feature.
    
    Args:
        message (str): The migration message to use.
    """
    # Get the directory of this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create Alembic configuration
    alembic_cfg = Config(os.path.join(current_dir, "alembic.ini"))
    alembic_cfg.set_main_option("script_location", current_dir)
    
    # Run the autogeneration command
    command.revision(alembic_cfg, message, autogenerate=True)
    print(f"Migration created with message: '{message}'")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a new database migration.")
    parser.add_argument(
        "message", 
        help="Migration message (will be used in the file name and description)"
    )
    
    args = parser.parse_args()
    create_migration(args.message)
