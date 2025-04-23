# Quantum Hub Database Setup

This document outlines the setup, migration, and management of the PostgreSQL database used by the Quantum Hub application.

## Database Architecture

The Quantum Hub uses a PostgreSQL database to store all application data. The data model follows a microservice architecture with each service having access to a common database but maintaining a clear separation of concerns.

### Technology Stack

- **Database**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0 with SQLModel
- **Migration Tool**: Alembic

## Local Development Setup

### 1. Start the PostgreSQL Database

The PostgreSQL database is configured in the `docker-compose.yml` file and can be started with:

```bash
docker-compose up -d postgres
```

Database connection details:
- **Host**: `localhost` (or `postgres` within Docker network)
- **Port**: `5432`
- **Database**: `quantum_hub`
- **Username**: `quantum_user`
- **Password**: `quantum_password`

### 2. Database Access

To connect to the database directly for debugging or administration:

```bash
docker-compose exec postgres psql -U quantum_user -d quantum_hub
```

## Database Migrations

The project uses Alembic to manage database migrations. Migration scripts are located in `services/shared/database/migrations`.

### Creating a New Migration

To create a new migration based on model changes:

```bash
cd services/shared/database/migrations
python create_migration.py "Description of the changes"
```

This will automatically generate a new migration script in the `versions` directory.

### Running Migrations

To apply migrations to your database:

```bash
cd services/shared/database/migrations
python run_migrations.py
```

To see the SQL that would be executed without applying it:

```bash
python run_migrations.py --sql
```

## Data Models

The Quantum Hub data model is organized into several domains:

1. **User & Authentication**: `User`, `UserProfile`, `UserApiKey`, `UserSession`
2. **Development & Applications**: `Project`, `QuantumApp`, `AppVersion`
3. **Marketplace & Monetization**: `MarketplaceListing`, `Subscription`, `SubscriptionKey`
4. **Execution & Hardware**: `Platform`, `Device`, `Job`, `JobResult`

For detailed information about each model and its fields, see the model definition files in `services/shared/database/models/`.

## Important Notes

1. **Connection Management**: Use the provided `get_db()` and `get_async_db()` functions from `services/shared/database/db.py` to manage database connections safely.

2. **Connection Pooling**: The database engines are configured with connection pooling to optimize performance.

3. **Transactions**: Always ensure your operations are wrapped in transactions to maintain data consistency.

4. **Environment Variables**: The database connection can be configured using environment variables:
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_HOST`
   - `POSTGRES_PORT`
   - `POSTGRES_DB`

5. **Schema Evolution**: When making changes to models:
   - Always create a migration
   - Test the migration in both directions (up/down)
   - Document breaking changes

## Backup and Recovery

For local development, you can create database backups using:

```bash
docker-compose exec postgres pg_dump -U quantum_user -d quantum_hub > backup_$(date +%Y%m%d_%H%M%S).sql
```

To restore a backup:

```bash
cat backup_file.sql | docker-compose exec -T postgres psql -U quantum_user -d quantum_hub
```

For production environments, a more robust backup strategy with automated, scheduled backups should be implemented.
