-- Migration script to clean up redundant tables

-- First, drop the foreign key constraint from user_api_keys to users
ALTER TABLE user_api_keys DROP CONSTRAINT user_api_keys_user_id_fkey;

-- Drop the redundant user_api_keys table
DROP TABLE user_api_keys;

-- Drop the redundant users table
DROP TABLE users;

-- Verify the changes
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
