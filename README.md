# Horse Management API

A NestJS-based REST API for managing horses and their owners. Built with TypeScript, PostgreSQL, and Prisma ORM.

## Features

- Horse Management (CRUD operations)
- Owner Management (CRUD operations)
- Role-based Access Control (Admin/Vet roles)
- Horse Health Status Tracking
- Advanced Filtering and Search
- Data Validation and Error Handling
- Interactive API Documentation (Swagger/OpenAPI)
- **Health Check Endpoint** for service availability monitoring
- **Request Logging System** with JSON format for monitoring and troubleshooting

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Testing**: Jest, Supertest
- **Container**: Docker

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (only for local development)
- pnpm (only for local development)

## Quick Start

### Running the Application

1. Clone the repository:

   ```bash
   git clone https://github.com/no13bus/horse-api
   cd horse-api
   ```

2. Start the application using Docker Compose:

   ```bash
   docker compose up --build
   ```

   This will:

   - Start a PostgreSQL database
   - Run database migrations
   - Start the API server on port 3000

3. Access the API documentation:
   ```
   http://localhost:3000/api-docs
   ```
   💡 **Strongly recommend using Swagger UI for API testing**:
   - Test all APIs directly in the browser without writing curl commands
   - Request parameter validation
   - Easy role-based access testing (set x-user-role through UI)
   - Clear request/response schema documentation

### Running Tests

1. Run the end-to-end tests:

   ```bash
   docker compose -f docker-compose.test.yml run --rm --build test
   ```

   This will:

   - Set up a clean test database
   - Run migrations
   - Execute all end-to-end tests
   - Clean up test containers

## API Endpoints

### Horses

- `GET /api/v1/horses` - List all horses
- `GET /api/v1/horses/:id` - Get a specific horse
- `POST /api/v1/horses` - Create a new horse (Admin only)
- `PUT /api/v1/horses/:id` - Update a horse (Admin only)
- `DELETE /api/v1/horses/:id` - Delete a horse (Admin only)
- `PATCH /api/v1/horses/:id/health` - Update horse health status (Admin/Vet)

### Owners

- `GET /api/v1/owners` - List all owners
- `GET /api/v1/owners/:id` - Get a specific owner
- `POST /api/v1/owners` - Create a new owner (Admin only)
- `PUT /api/v1/owners/:id` - Update an owner (Admin only)
- `DELETE /api/v1/owners/:id` - Delete an owner (Admin only)

## Role-Based Access

The API implements role-based access control using NestJS Guards and custom decorators:

- Uses `x-user-role` header for role identification
- Implemented via `RolesGuard` and `@Roles()` decorator
- Roles are checked at the controller/endpoint level

Available roles:

- `admin`: Full access to all endpoints
- `vet`: Can read all data and update horse health status
- No role: Access denied

## Testing

The project includes comprehensive end-to-end tests covering:

- CRUD operations
- Role-based access control
- Data validation
- Error handling
- Filtering on the GET / api/v1/horses endpoint.

Tests are automatically run in a separate Docker container with its own database to ensure isolation.

## Database Schema

The database contains two main tables:

### Horse Table

| Field        | Type     | Description                                       |
| ------------ | -------- | ------------------------------------------------- |
| id           | Integer  | Primary key, auto-increment                       |
| name         | String   | Horse name                                        |
| age          | Integer  | Age                                               |
| breed        | String   | Breed                                             |
| healthStatus | Enum     | Health status: HEALTHY/INJURED/RECOVERING/UNKNOWN |
| owner        | Integer  | Owner ID (Foreign key)                            |
| createdAt    | DateTime | Creation timestamp                                |
| updatedAt    | DateTime | Last update timestamp                             |

### Owner Table

| Field     | Type     | Description                 |
| --------- | -------- | --------------------------- |
| id        | Integer  | Primary key, auto-increment |
| name      | String   | Owner name                  |
| email     | String   | Email (Unique)              |
| createdAt | DateTime | Creation timestamp          |
| updatedAt | DateTime | Last update timestamp       |

### Relationships

- One-to-Many relationship between Owner and Horse: one owner can have multiple horses
- Cascade deletion: when an owner is deleted, all their horses are automatically removed

## Error Handling

The API uses standard HTTP status codes and returns consistent error response format(NestJS standard):

```json
{
  "message": "Error message description",
  "error": "Error type",
  "statusCode": xxx
}
```

Common status codes:

- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Server Error

## Validation Rules

### Horse

- `name`: Required, string
- `age`: Required, number between 1 and 30 years
- `breed`: Required, string
- `healthStatus`: Required, enum (HEALTHY, INJURED, RECOVERING, UNKNOWN)
- `owner`: Required, must be a valid owner ID

### Owner

- `name`: Required, string
- `email`: Required, must be a valid email format, must be unique

## Monitoring

The API exposes health check endpoints:

- `GET /health`: Basic health check

## Logging System

The API logs all HTTP requests in JSON format for monitoring and debugging:

- Success and error requests tracking
- Stored in `logs/combined.log` and `logs/error.log`
- Includes timestamp, method, URL, status code, and response time
