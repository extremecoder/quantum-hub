# Project Service

The Project Service is responsible for managing quantum development projects within the Quantum Hub platform. It provides APIs for creating, retrieving, updating, and deleting projects, as well as releasing projects as quantum applications.

## Features

- Project CRUD operations
- Project release to create quantum applications
- Integration with the Auth Service for user authentication

## API Endpoints

- `GET /projects` - List user's projects
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project
- `POST /projects/{id}/release` - Release project as app (creates QuantumApp)

## Getting Started

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Docker (optional)

### Running the Service

#### Using Docker

```bash
docker-compose up project_service
```

#### Standalone

```bash
cd services/project_service
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

## Development

### Project Structure

```
project_service/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   └── projects.py
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── schemas/
│   │   └── project.py
│   ├── services/
│   │   └── project_service.py
│   └── main.py
├── Dockerfile
└── README.md
```

### Testing

```bash
pytest services/project_service/tests
```
