# Auth Service

The Auth Service is responsible for user authentication and authorization within the Quantum Hub platform. It provides APIs for user registration, login, token management, and API key management.

## Features

- User registration and login
- JWT token generation and validation
- Password reset and email verification
- API key management
- OAuth integration with Google

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `POST /auth/reset-password` - Request password reset
- `POST /auth/reset-password/{token}` - Complete password reset
- `GET /auth/verify/{token}` - Verify email address
- `POST /auth/google` - Initialize Google OAuth login
- `GET /auth/google/callback` - Handle Google OAuth callback

### User Management
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile

### API Key Management
- `GET /api-keys` - List user's API keys
- `POST /api-keys` - Create new API key
- `GET /api-keys/{id}` - Get API key details
- `PUT /api-keys/{id}` - Update API key
- `DELETE /api-keys/{id}` - Delete/revoke API key
- `GET /api-keys/usage/stats` - Get API usage statistics

## Getting Started

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Docker (optional)

### Running the Service

#### Using Docker

```bash
docker-compose up auth_service
```

#### Standalone

```bash
cd services/auth_service
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Development

### Project Structure

```
auth_service/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   └── api_keys.py
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── dependencies/
│   │   └── users.py
│   ├── schemas/
│   │   ├── token.py
│   │   ├── user.py
│   │   └── api_key.py
│   ├── services/
│   │   ├── user_service.py
│   │   └── api_key_service.py
│   └── main.py
├── Dockerfile
└── README.md
```

### Testing

```bash
pytest services/auth_service/tests
```
