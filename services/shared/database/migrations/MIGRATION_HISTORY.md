# Database Migration History

This document tracks the history of database migrations applied to the Quantum Hub database.

## Migration List

| Revision ID | Date       | Description                | Author        | Notes                                                |
|-------------|------------|----------------------------|---------------|------------------------------------------------------|
| 001         | 2025-04-08 | Initial schema             | Quantum Team  | Created initial database schema with all base tables |
| 002         | 2025-04-09 | Update URL fields to Text  | Quantum Team  | Changed URL fields from String(255) to Text type     |

## Migration Details

### 001 - Initial schema (2025-04-08)

Initial database schema creation with the following tables:
- User tables: `user`, `user_profile`, `user_api_key`, `user_session`
- Application tables: `quantum_app`, `app_version`, `project`
- Marketplace tables: `marketplace_listing`, `subscription`, `subscription_key`
- Execution tables: `platform`, `device`, `job`, `job_result`

### 002 - Update URL fields to Text (2025-04-09)

Changed URL fields from String(255) to Text type to allow for longer URLs:
- `user_api_key.value`: Changed from String(255) to Text
- `platform.api_endpoint`: Changed from String(255) to Text
- `user_profile.avatar_url`: Changed from String(255) to Text
- `user_session.token`: Changed from String(255) to Text
- `user_session.user_agent`: Changed from String(255) to Text

This change ensures that URL fields can store strings of unlimited length, preventing truncation of long URLs, API keys, and other potentially long string values.
