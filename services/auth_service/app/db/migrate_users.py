"""
Migration script to move data from the old users table to the shared user table.

This script is used to migrate user data from the Auth Service's users table
to the shared user table. It should be run after updating the Auth Service
to use the shared database models.
"""
import asyncio
import logging
import os
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from uuid import UUID

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_USER = os.getenv("POSTGRES_USER", "quantum_user")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "quantum_password")
DB_HOST = os.getenv("POSTGRES_HOST", "postgres")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "quantum_hub")

# Create connection string
DB_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create engine and session
engine = create_async_engine(DB_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def check_tables():
    """Check if the tables exist."""
    async with engine.connect() as conn:
        # Check if users table exists
        result = await conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
        ))
        users_exists = result.scalar()
        
        # Check if user table exists
        result = await conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user')"
        ))
        user_exists = result.scalar()
        
        return users_exists, user_exists


async def count_records():
    """Count records in both tables."""
    async with engine.connect() as conn:
        # Count users in users table
        result = await conn.execute(text("SELECT COUNT(*) FROM users"))
        users_count = result.scalar()
        
        # Count users in user table
        result = await conn.execute(text("SELECT COUNT(*) FROM \"user\""))
        user_count = result.scalar()
        
        return users_count, user_count


async def migrate_users():
    """Migrate users from users table to user table."""
    async with async_session() as session:
        # Get all users from users table
        result = await session.execute(text("""
            SELECT id, username, email, hashed_password, full_name, 
                   is_active, is_provider, roles, created_at, updated_at
            FROM users
        """))
        users = result.fetchall()
        
        logger.info(f"Found {len(users)} users to migrate")
        
        # Insert users into user table
        for user in users:
            # Check if user already exists in user table
            check_result = await session.execute(text(
                "SELECT COUNT(*) FROM \"user\" WHERE id = :id"
            ), {"id": user.id})
            exists = check_result.scalar()
            
            if exists:
                logger.info(f"User {user.username} already exists in user table, skipping")
                continue
            
            # Convert roles array to PostgreSQL array format
            roles_str = "{" + ",".join(f'"{role}"' for role in user.roles) + "}" if user.roles else "{CONSUMER}"
            
            # Insert user into user table
            await session.execute(text("""
                INSERT INTO "user" (
                    id, username, email, hashed_password, full_name, 
                    roles, is_active, is_provider, created_at, updated_at
                ) VALUES (
                    :id, :username, :email, :hashed_password, :full_name, 
                    :roles, :is_active, :is_provider, :created_at, :updated_at
                )
            """), {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "hashed_password": user.hashed_password,
                "full_name": user.full_name,
                "roles": roles_str,
                "is_active": user.is_active,
                "is_provider": user.is_provider,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            })
            
            logger.info(f"Migrated user {user.username}")
        
        # Commit the transaction
        await session.commit()


async def migrate_api_keys():
    """Migrate API keys from user_api_keys table to user_api_key table."""
    async with async_session() as session:
        # Get all API keys from user_api_keys table
        result = await session.execute(text("""
            SELECT id, user_id, name, key, is_active, created_at, updated_at, expires_at
            FROM user_api_keys
        """))
        api_keys = result.fetchall()
        
        logger.info(f"Found {len(api_keys)} API keys to migrate")
        
        # Insert API keys into user_api_key table
        for api_key in api_keys:
            # Check if API key already exists in user_api_key table
            check_result = await session.execute(text(
                "SELECT COUNT(*) FROM user_api_key WHERE id = :id"
            ), {"id": api_key.id})
            exists = check_result.scalar()
            
            if exists:
                logger.info(f"API key {api_key.name} already exists in user_api_key table, skipping")
                continue
            
            # Insert API key into user_api_key table
            await session.execute(text("""
                INSERT INTO user_api_key (
                    id, user_id, name, value, status, expire_at, created_at, updated_at
                ) VALUES (
                    :id, :user_id, :name, :value, :status, :expire_at, :created_at, :updated_at
                )
            """), {
                "id": api_key.id,
                "user_id": api_key.user_id,
                "name": api_key.name,
                "value": api_key.key,
                "status": "active" if api_key.is_active else "revoked",
                "expire_at": api_key.expires_at,
                "created_at": api_key.created_at,
                "updated_at": api_key.updated_at
            })
            
            logger.info(f"Migrated API key {api_key.name}")
        
        # Commit the transaction
        await session.commit()


async def update_foreign_keys():
    """Update foreign keys to point to the new user table."""
    async with async_session() as session:
        # Update refresh_tokens table
        await session.execute(text("""
            ALTER TABLE refresh_tokens 
            DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_fkey;
            
            ALTER TABLE refresh_tokens
            ADD CONSTRAINT refresh_tokens_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE;
        """))
        
        # Update password_resets table
        await session.execute(text("""
            ALTER TABLE password_resets 
            DROP CONSTRAINT IF EXISTS password_resets_user_id_fkey;
            
            ALTER TABLE password_resets
            ADD CONSTRAINT password_resets_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE;
        """))
        
        # Update email_verifications table
        await session.execute(text("""
            ALTER TABLE email_verifications 
            DROP CONSTRAINT IF EXISTS email_verifications_user_id_fkey;
            
            ALTER TABLE email_verifications
            ADD CONSTRAINT email_verifications_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE;
        """))
        
        # Commit the transaction
        await session.commit()
        
        logger.info("Updated foreign keys to point to the new user table")


async def main():
    """Main migration function."""
    try:
        # Check if tables exist
        users_exists, user_exists = await check_tables()
        
        if not users_exists:
            logger.error("users table does not exist, cannot migrate")
            return
        
        if not user_exists:
            logger.error("user table does not exist, cannot migrate")
            return
        
        # Count records before migration
        users_count, user_count = await count_records()
        logger.info(f"Before migration: {users_count} users in users table, {user_count} users in user table")
        
        # Migrate users
        await migrate_users()
        
        # Migrate API keys
        await migrate_api_keys()
        
        # Update foreign keys
        await update_foreign_keys()
        
        # Count records after migration
        users_count, user_count = await count_records()
        logger.info(f"After migration: {users_count} users in users table, {user_count} users in user table")
        
        logger.info("Migration completed successfully")
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
    finally:
        # Close the engine
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
