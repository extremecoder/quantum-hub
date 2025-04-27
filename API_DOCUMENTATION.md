# Quantum Hub API Documentation

This document provides a guide to using the Quantum Hub APIs for authentication, user management, project management, and more.

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [API Key Management](#api-key-management)
4. [Project Management](#project-management)
5. [Testing with Swagger UI](#testing-with-swagger-ui)

## Authentication

The Auth Service provides endpoints for user authentication and authorization.

### Base URL

```
http://localhost:8001/api/v1/auth
```

### Endpoints

#### Register a New User

```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "is_active": true,
  "is_provider": false
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "is_active": true,
    "is_provider": false,
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
}
```

#### Login

The login endpoint supports both form data and JSON formats.

**Option 1: Form Data**
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=johndoe&password=securepassword123
```

**Option 2: JSON**
```http
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword123"
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "is_active": true,
    "is_provider": false,
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "is_active": true,
    "is_provider": false,
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
{
  "message": "Successfully logged out"
}
```

#### Request Password Reset

```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

Response:

```json
{
  "message": "If your email is registered, you will receive a password reset link"
}
```

#### Complete Password Reset

```http
POST /auth/reset-password/{token}
Content-Type: application/json

{
  "new_password": "newsecurepassword123"
}
```

Response:

```json
{
  "message": "Password has been reset successfully"
}
```

#### Verify Email

```http
GET /auth/verify/{token}
```

Response:

```json
{
  "message": "Email verified successfully"
}
```

## User Management

### Base URL

```
http://localhost:8001/api/v1/users
```

### Endpoints

#### Get Current User Profile

```http
GET /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_provider": false,
  "created_at": "2023-06-01T12:00:00Z",
  "updated_at": "2023-06-01T12:00:00Z"
}
```

#### Update Current User Profile

```http
PUT /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "full_name": "John Smith Doe",
  "is_provider": true
}
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "full_name": "John Smith Doe",
  "is_active": true,
  "is_provider": true,
  "created_at": "2023-06-01T12:00:00Z",
  "updated_at": "2023-06-01T12:30:00Z"
}
```

## API Key Management

### Base URL

```
http://localhost:8001/api/v1/api-keys
```

### Endpoints

#### Create API Key

```http
POST /api-keys
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Production API Key",
  "expires_at": "2024-06-01T12:00:00Z"
}
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Production API Key",
  "key": "qh_pk_1234567890abcdefghijklmnopqrstuvwxyz",
  "created_at": "2023-06-01T12:00:00Z",
  "expires_at": "2024-06-01T12:00:00Z",
  "is_active": true
}
```

#### Get API Keys

```http
GET /api-keys
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Production API Key",
    "key": "qh_pk_************wxyz",
    "created_at": "2023-06-01T12:00:00Z",
    "expires_at": "2024-06-01T12:00:00Z",
    "is_active": true
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174000",
    "name": "Development API Key",
    "key": "qh_dk_************abcd",
    "created_at": "2023-06-01T12:30:00Z",
    "expires_at": null,
    "is_active": true
  }
]
```

#### Get API Key

```http
GET /api-keys/{key_id}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Production API Key",
  "key": "qh_pk_************wxyz",
  "created_at": "2023-06-01T12:00:00Z",
  "expires_at": "2024-06-01T12:00:00Z",
  "is_active": true
}
```

#### Update API Key

```http
PUT /api-keys/{key_id}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Updated Production API Key",
  "is_active": false
}
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Updated Production API Key",
  "key": "qh_pk_************wxyz",
  "created_at": "2023-06-01T12:00:00Z",
  "expires_at": "2024-06-01T12:00:00Z",
  "is_active": false
}
```

#### Delete API Key

```http
DELETE /api-keys/{key_id}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
{
  "message": "API key deleted successfully"
}
```

#### Get API Usage Statistics

```http
GET /api-keys/usage/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
{
  "total_requests": 1250,
  "total_requests_limit": 50000,
  "compute_time_hours": 5.75,
  "compute_time_limit": 100.0
}
```

## Project Management

### Base URL

```
http://localhost:8002/api/v1/projects
```

### Endpoints

#### Create Project

```http
POST /projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Quantum Teleportation",
  "description": "A quantum teleportation circuit implementation",
  "repo": "https://github.com/user/quantum-teleportation"
}
```

Response:

```json
{
  "message": "Project created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Quantum Teleportation",
    "description": "A quantum teleportation circuit implementation",
    "repo": "https://github.com/user/quantum-teleportation",
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
}
```

#### Get Projects

```http
GET /projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
{
  "message": "Projects retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Quantum Teleportation",
      "description": "A quantum teleportation circuit implementation",
      "repo": "https://github.com/user/quantum-teleportation",
      "created_at": "2023-06-01T12:00:00Z",
      "updated_at": "2023-06-01T12:00:00Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174000",
      "name": "Quantum Error Correction",
      "description": "A quantum error correction implementation",
      "repo": "https://github.com/user/quantum-error-correction",
      "created_at": "2023-06-02T12:00:00Z",
      "updated_at": "2023-06-02T12:00:00Z"
    }
  ]
}
```

#### Get Project

```http
GET /projects/{project_id}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
{
  "message": "Project retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Quantum Teleportation",
    "description": "A quantum teleportation circuit implementation",
    "repo": "https://github.com/user/quantum-teleportation",
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
}
```

#### Update Project

```http
PUT /projects/{project_id}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Advanced Quantum Teleportation",
  "description": "An advanced quantum teleportation circuit implementation"
}
```

Response:

```json
{
  "message": "Project updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Advanced Quantum Teleportation",
    "description": "An advanced quantum teleportation circuit implementation",
    "repo": "https://github.com/user/quantum-teleportation",
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:30:00Z"
  }
}
```

#### Delete Project

```http
DELETE /projects/{project_id}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
{
  "message": "Project deleted successfully",
  "data": null
}
```

#### Release Project

```http
POST /projects/{project_id}/release
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Quantum Teleportation App",
  "description": "A quantum teleportation application",
  "type": "CIRCUIT",
  "version_number": "1.0.0",
  "sdk_used": "QISKIT",
  "visibility": "PRIVATE",
  "input_schema": {
    "type": "object",
    "properties": {
      "qubit_count": {
        "type": "integer",
        "minimum": 3
      }
    }
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "results": {
        "type": "object"
      }
    }
  },
  "preferred_platform": "IBM",
  "preferred_device_id": "ibmq_qasm_simulator",
  "number_of_qubits": 3
}
```

Response:

```json
{
  "message": "Project released successfully",
  "data": {
    "id": "323e4567-e89b-12d3-a456-426614174000",
    "name": "Quantum Teleportation App",
    "description": "A quantum teleportation application",
    "type": "CIRCUIT",
    "status": ["DRAFT"],
    "visibility": "PRIVATE",
    "created_at": "2023-06-01T13:00:00Z",
    "updated_at": "2023-06-01T13:00:00Z"
  }
}
```

#### Release Project with File Upload

```http
POST /projects/{project_id}/release/with-file
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

name: Quantum Teleportation App
description: A quantum teleportation application
type: CIRCUIT
version_number: 1.0.0
sdk_used: QISKIT
visibility: PRIVATE
preferred_platform: IBM
preferred_device_id: ibmq_qasm_simulator
number_of_qubits: 3
package_file: [binary file content]
```

Response:

```json
{
  "message": "Project released successfully with file upload",
  "data": {
    "id": "323e4567-e89b-12d3-a456-426614174000",
    "name": "Quantum Teleportation App",
    "description": "A quantum teleportation application",
    "type": "CIRCUIT",
    "status": ["DRAFT"],
    "visibility": "PRIVATE",
    "created_at": "2023-06-01T13:00:00Z",
    "updated_at": "2023-06-01T13:00:00Z"
  }
}
```

#### Download Package File

```http
GET /projects/versions/{version_id}/download
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

Binary file content with appropriate headers:
- `Content-Type: application/octet-stream`
- `Content-Disposition: attachment; filename=package.zip`
```

## Testing with Swagger UI

You can test the APIs using the Swagger UI interface provided by FastAPI.

### Auth Service Swagger UI

```
http://localhost:8001/api/v1/docs
```

### Project Service Swagger UI

```
http://localhost:8002/api/v1/docs
```

### Using Swagger UI

1. Open the Swagger UI URL in your browser
2. Click on an endpoint to expand it
3. Click the "Try it out" button
4. Fill in the required parameters
5. Click "Execute" to send the request
6. View the response

### Authentication in Swagger UI

For endpoints that require authentication:

1. Click the "Authorize" button at the top of the page
2. Enter your JWT token in the format: `Bearer your_token_here`
3. Click "Authorize" to save
4. Now you can access protected endpoints

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "message": "Error message describing what went wrong",
  "error": "error_code"
}
```

Common error codes:

- `invalid_credentials`: Authentication failed
- `not_found`: Resource not found
- `validation_error`: Invalid input data
- `unauthorized`: Missing or invalid authentication
- `forbidden`: Insufficient permissions
- `internal_error`: Server error
