# Quantum Hub

![Quantum Hub](https://via.placeholder.com/800x400.png?text=Quantum+Hub)

## Overview

Quantum Hub is a comprehensive platform for quantum application development, distribution, and execution. It serves as a centralized ecosystem where developers can build, publish, and monetize quantum applications, while consumers can discover, subscribe to, and execute quantum algorithms on various quantum hardware platforms.

### Key Features

- **Quantum Application Development**: Build quantum applications with embedded IDE support
- **Registry**: Discover and download open-source quantum applications
- **Marketplace**: Publish, monetize, and subscribe to commercial quantum applications
- **Multi-Provider Support**: Connect to IBM Quantum, AWS Braket, Azure Quantum, Google Quantum AI, and more
- **Job Execution & Monitoring**: Submit quantum jobs and track execution status
- **Hardware Selection**: Choose from various quantum processors across multiple providers
- **Analytics & Insights**: Monitor performance metrics, usage statistics, and revenue

## Architecture

The Quantum Hub is built on a modern microservices architecture with a clear separation of concerns. Each service is responsible for a specific domain and communicates via REST APIs.

### Tech Stack

- **Frontend**: Next.js/React with TypeScript, TailwindCSS
- **Backend Services**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL 14+ with SQLAlchemy 2.0/SQLModel
- **Authentication**: JWT with bcrypt password hashing
- **Storage**: PostgreSQL (development), AWS S3 (production)
- **Containerization**: Docker and Kubernetes
- **CI/CD**: GitHub Actions

### System Architecture

```
                             +------------------+
                             |                  |
                             |     Frontend     |
                             |    (Next.js)     |
                             |                  |
                             +--------+---------+
                                      |
                                      | HTTP/REST
                                      |
                             +--------v---------+
                             |                  |
                             |   API Gateway    |
                             |                  |
                             +--------+---------+
                                      |
         +------------------------+---+---+------------------------+
         |                        |       |                        |
+--------v--------+    +----------v-------+    +---------v--------+    More
|                 |    |                  |    |                  |    Services...
|  Auth Service   |    |  Project Service |    |   App Service    |
|    (FastAPI)    |    |    (FastAPI)     |    |    (FastAPI)     |
|                 |    |                  |    |                  |
+--------+--------+    +----------+-------+    +---------+--------+
         |                        |                      |
         |                        |                      |
         |                        |                      |
         |              +---------v----------+           |
         |              |                    |           |
         +------------->|     PostgreSQL     |<----------+
                        |                    |
                        +--------------------+
```

### Services

1. **Auth Service**: User authentication, registration, and session management
2. **User Service**: User profile and preferences management
3. **Project Service**: Development project management and IDE integration
4. **App Service**: Quantum application management, versioning, and packaging
5. **Registry Service**: Distribution of open-source quantum applications
6. **Marketplace Service**: Commercial quantum application discovery and purchasing
7. **Execution Service**: Job submission, scheduling, and result handling
8. **Billing Service**: Subscription management and payment processing
9. **Analytics Service**: Usage tracking and reporting

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.10+ (for backend development)
- PostgreSQL 14+ (for local development without Docker)

### Quick Start with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/quantum-hub.git
   cd quantum-hub
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```

3. Access the Quantum Hub:
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8000
   - Swagger UI (API Documentation): http://localhost:8000/docs

### Local Development Setup

#### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The frontend will be available at http://localhost:3000

#### Backend Services

1. Set up a Python virtual environment:
   ```bash
   cd services/auth_service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the service:
   ```bash
   uvicorn main:app --reload --port 8001
   ```

4. Repeat for other services, using different ports

## Project Documentation

- `PLANNING.md` - Frontend architecture and design
- `PLANNING_BACKEND.md` - Backend architecture and design
- `TASK.md` - Frontend implementation tasks
- `TASK_BACKEND.md` - Backend implementation tasks
- `API_DOCUMENTATION.md` - Detailed API documentation with examples
- `TESTING.md` - Instructions for running tests

## Deployment

The Quantum Hub is designed to be deployed in a Kubernetes environment:

1. Build and push Docker images:
   ```bash
   docker-compose build
   docker-compose push
   ```

2. Apply Kubernetes manifests:
   ```bash
   kubectl apply -f kubernetes/
   ```

## API Documentation

API documentation is available in multiple formats:

### Swagger/OpenAPI UI

API documentation is automatically generated using Swagger/OpenAPI:

- Auth Service: http://localhost:8001/api/v1/docs
- Project Service: http://localhost:8002/api/v1/docs
- Additional service endpoints documented in Swagger UI

### Detailed Documentation

For more detailed API documentation with examples, see:

- [API Documentation](API_DOCUMENTATION.md) - Comprehensive guide with request/response examples
- [Testing Guide](TESTING.md) - Instructions for testing the APIs

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Acknowledgements

- [IBM Quantum](https://quantum-computing.ibm.com/)
- [AWS Braket](https://aws.amazon.com/braket/)
- [Azure Quantum](https://azure.microsoft.com/en-us/services/quantum/)
- [Google Quantum AI](https://quantumai.google/)
- [Qiskit](https://qiskit.org/)
- [Cirq](https://quantumai.google/cirq)
- [Pennylane](https://pennylane.ai/)
- [Braket SDK](https://github.com/aws/amazon-braket-sdk-python)
