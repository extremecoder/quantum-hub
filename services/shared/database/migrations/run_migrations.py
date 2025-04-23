#!/usr/bin/env python
"""
Helper script to run database migrations.

This script uses Alembic to run database migrations to update
the database schema to the latest version.
"""
import os
import sys
import argparse
from pathlib import Path

# Adjust Python path to find the project modules
script_dir = Path(__file__).resolve().parent
project_root = script_dir.parent.parent.parent.parent
sys.path.append(str(project_root))

from alembic.config import Config
from alembic import command


def run_migrations(revision="head", sql=False):
    """
    Run database migrations using Alembic.
    
    Args:
        revision (str): The revision to upgrade to, defaults to "head" (latest).
        sql (bool): If True, print the SQL statements instead of executing them.
    """
    # Get the directory of this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create Alembic configuration
    alembic_cfg = Config(os.path.join(current_dir, "alembic.ini"))
    alembic_cfg.set_main_option("script_location", current_dir)
    
    # Run the upgrade command
    if sql:
        command.upgrade(alembic_cfg, revision, sql=True)
    else:
        command.upgrade(alembic_cfg, revision)
        print(f"Database migrated to revision: {revision}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run database migrations.")
    parser.add_argument(
        "--revision", 
        default="head",
        help="The revision to upgrade to (default: head)"
    )
    parser.add_argument(
        "--sql", 
        action="store_true",
        help="Print SQL statements instead of executing them"
    )
    
    args = parser.parse_args()
    run_migrations(args.revision, args.sql)
