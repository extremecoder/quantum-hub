# Auth Service Database Migration

This document describes the migration from the Auth Service's separate user tables to the shared database models.

## Background

The Auth Service was initially developed with its own user-related tables:
- `users` - Core user information
- `user_api_keys` - API keys for user authentication

Meanwhile, the shared database models defined similar tables:
- `user` - Core user information
- `user_api_key` - API keys for user authentication
- `user_profile` - Extended user profile information
- `user_session` - User login sessions

Having duplicate user tables causes several problems:
1. Data inconsistency
2. Authentication confusion
3. Foreign key relationship issues
4. Service integration problems
5. Development complexity

## Migration Steps

The migration involves the following steps:

1. **Update Auth Service Code**
   - Modify the Auth Service to use the shared database models
   - Update all repositories and services to use the shared models
   - Update API endpoints to use the shared models
   - Update test fixtures to use the shared models

2. **Migrate Data**
   - Run the migration script to move data from the old tables to the shared tables
   - Update foreign key relationships to point to the shared tables

## Running the Migration

To run the migration:

```bash
cd services/auth_service/app/db
python run_migration.py
```

The migration script performs the following actions:
1. Checks if both the old and new tables exist
2. Counts records in both tables before migration
3. Migrates users from `users` to `user`
4. Migrates API keys from `user_api_keys` to `user_api_key`
5. Updates foreign key relationships to point to the new tables
6. Counts records in both tables after migration

## Post-Migration

After the migration, the Auth Service will use the shared database models. The old tables (`users` and `user_api_keys`) will still exist but will no longer be used.

In a future update, these tables can be dropped once we're confident that the migration was successful and all services are using the shared models correctly.

## Rollback

If you need to rollback the migration:

1. Revert the code changes to use the old models
2. The data in the old tables should still be intact

## Notes

- The migration does not delete any data from the old tables
- The migration is idempotent and can be run multiple times safely
- Users that already exist in the shared tables will be skipped during migration
