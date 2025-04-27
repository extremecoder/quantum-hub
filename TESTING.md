# Testing the Quantum Hub Backend

This document provides instructions for running tests for the Quantum Hub backend services.

## Prerequisites

Before running the tests, make sure you have the following installed:

- Python 3.10+
- pytest
- pytest-asyncio
- httpx
- SQLAlchemy 2.0+

You can install the required packages using:

```bash
pip install pytest pytest-asyncio httpx sqlalchemy>=2.0.0 aiosqlite
```

## Running the Tests

### Auth Service Tests

To run all tests for the Auth Service:

```bash
cd /path/to/quantum-hub
python -m pytest services/auth_service/tests -v
```

To run specific test files:

```bash
# Run authentication tests
python -m pytest services/auth_service/tests/test_auth.py -v

# Run API key tests
python -m pytest services/auth_service/tests/test_api_keys.py -v

# Run user tests
python -m pytest services/auth_service/tests/test_users.py -v
```

### Project Service Tests

To run all tests for the Project Service:

```bash
cd /path/to/quantum-hub
python -m pytest services/project_service/tests -v
```

To run specific test files:

```bash
# Run project tests
python -m pytest services/project_service/tests/test_projects.py -v
```

## Test Coverage

To run tests with coverage:

```bash
pip install pytest-cov
python -m pytest --cov=services.auth_service services/auth_service/tests -v
python -m pytest --cov=services.project_service services/project_service/tests -v
```

To generate a coverage report:

```bash
python -m pytest --cov=services.auth_service --cov=services.project_service --cov-report=html services/auth_service/tests services/project_service/tests
```

This will generate an HTML coverage report in the `htmlcov` directory.

## Testing with Swagger UI

You can also test the APIs using the Swagger UI interface:

1. Start the services:

```bash
# Start the Auth Service
cd /path/to/quantum-hub
uvicorn services.auth_service.app.main:app --host 0.0.0.0 --port 8001 --reload

# Start the Project Service
cd /path/to/quantum-hub
uvicorn services.project_service.app.main:app --host 0.0.0.0 --port 8002 --reload
```

2. Open the Swagger UI in your browser:

- Auth Service: http://localhost:8001/api/v1/docs
- Project Service: http://localhost:8002/api/v1/docs

3. Use the Swagger UI to test the endpoints:
   - Click on an endpoint to expand it
   - Click "Try it out"
   - Fill in the required parameters
   - Click "Execute"
   - View the response

For endpoints that require authentication:
1. First, use the `/auth/register` or `/auth/login` endpoint to get a token
2. Click the "Authorize" button at the top of the page
3. Enter your token in the format: `Bearer your_token_here`
4. Click "Authorize"
5. Now you can access protected endpoints

## Troubleshooting

### Common Issues

1. **Import errors**: Make sure your PYTHONPATH includes the project root:

```bash
export PYTHONPATH=/path/to/quantum-hub:$PYTHONPATH
```

2. **Database errors**: The tests use an in-memory SQLite database, so no external database is required.

3. **Authentication errors**: If you're testing with Swagger UI, make sure you've properly authorized with a valid token.

### Getting Help

If you encounter any issues running the tests, please check:

1. That all dependencies are installed
2. That your PYTHONPATH is set correctly
3. That you're running the commands from the project root directory

For more detailed information about the API endpoints, refer to the [API Documentation](API_DOCUMENTATION.md).
