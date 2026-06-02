# Project Service API

A RESTful API service for managing projects, milestones, and configurations. Built with Node.js, Express, TypeScript, and MongoDB.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Projects Endpoints](#projects-endpoints)
  - [Configurations Endpoints](#configurations-endpoints)
  - [Milestones Endpoints](#milestones-endpoints)
- [Docker Deployment](#docker-deployment)
- [Development](#development)

## Features

- ✅ Complete CRUD operations for Projects
- ✅ Configuration management per project
- ✅ Milestone tracking per project
- ✅ JWT-based authentication
- ✅ Soft delete functionality
- ✅ Auto-generated project keys
- ✅ MongoDB integration
- ✅ TypeScript support
- ✅ Docker containerization

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Language:** TypeScript v5
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (via prime-qa-api-common)
- **Containerization:** Docker & Docker Compose

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (local instance or MongoDB Atlas account)
- **Docker** (optional, for containerized deployment)
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd project-service
```

2. **Install dependencies**

```bash
npm install
```

If you encounter dependency conflicts, use:

```bash
npm install --force
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8082
NODE_ENV=development

# Authentication
JWT_SECRET=your_secret_key_here

# Database
MONGO_URI=mongodb://localhost:27017/project-service
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### Running the Application

#### Development Mode

Start the application with hot-reload enabled:

```bash
npm run dev
```

The server will start on `http://localhost:8082` (or your configured PORT).

#### Production Mode

1. **Build the TypeScript code:**

```bash
npm run build
```

2. **Start the production server:**

```bash
npm start
```

#### Health Check

Verify the service is running:

```bash
curl http://localhost:8082/health
```

Expected response:
```json
{
  "status": "ok"
}
```

## API Documentation

### Base URL

```
http://localhost:8082
```

### Authentication

All endpoints (except `/health`) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Projects Endpoints

### 1. Get All Projects

Retrieves a list of all projects in the system.

**Endpoint:** `GET /projects`

**Authentication:** Required

**Request Parameters:** None

**Response:** `200 OK`

```typescript
Response: Array<{
  _id: string;              // MongoDB ObjectId
  name: string;             // Project name
  key: string;              // Unique project key (e.g., "PMS")
  description?: string;     // Optional project description
  owner: string;            // User ID of the project owner
  visibility: "private" | "public";  // Project visibility
  isActive: boolean;        // Whether the project is active
  createdAt: Date;          // Creation timestamp
  updatedAt: Date;          // Last update timestamp
}>
```

**Example Request:**

```bash
curl -X GET http://localhost:8082/projects \
  -H "Authorization: Bearer <token>"
```

**Example Response:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Project Management System",
    "key": "PMS",
    "description": "A system for managing projects",
    "owner": "user123",
    "visibility": "private",
    "isActive": true,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z"
  }
]
```

---

### 2. Get Project By ID

Retrieves a single project by its unique ID.

**Endpoint:** `GET /projects/:id`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `id`      | string | Yes      | MongoDB ObjectId of the project |

**Response:** `200 OK` or `404 Not Found`

```typescript
Response: {
  _id: string;
  name: string;
  key: string;
  description?: string;
  owner: string;
  visibility: "private" | "public";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example Request:**

```bash
curl -X GET http://localhost:8082/projects/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

**Example Response (Success):**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Project Management System",
  "key": "PMS",
  "description": "A system for managing projects",
  "owner": "user123",
  "visibility": "private",
  "isActive": true,
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Example Response (Not Found):**

```json
{
  "message": "Project not found"
}
```

---

### 3. Create Project

Creates a new project in the system.

**Endpoint:** `POST /projects`

**Authentication:** Required

**Request Body:**

| Field        | Type   | Required | Description                                      |
|--------------|--------|----------|--------------------------------------------------|
| `name`       | string | Yes      | Name of the project                              |
| `key`        | string | No       | Unique key (auto-generated if not provided)      |
| `description`| string | No       | Description of the project                       |
| `owner`      | string | Yes      | User ID of the project owner                     |
| `visibility` | string | No       | Either "private" or "public" (default: "private")|

**Response:** `201 Created`

```typescript
Request Body: {
  name: string;             // Required
  key?: string;             // Optional (auto-generated from name)
  description?: string;     // Optional
  owner: string;            // Required
  visibility?: "private" | "public";  // Optional (default: "private")
}

Response: {
  _id: string;
  name: string;
  key: string;
  description?: string;
  owner: string;
  visibility: "private" | "public";
  isActive: boolean;        // Defaults to true
  createdAt: Date;
  updatedAt: Date;
}
```

**Example Request:**

```bash
curl -X POST http://localhost:8082/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "This is a new project",
    "owner": "user123",
    "visibility": "private"
  }'
```

**Example Response:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "New Project",
  "key": "NP",
  "description": "This is a new project",
  "owner": "user123",
  "visibility": "private",
  "isActive": true,
  "createdAt": "2026-01-20T10:00:00.000Z",
  "updatedAt": "2026-01-20T10:00:00.000Z"
}
```

**Notes:**
- If `key` is not provided, it will be auto-generated from the project name (e.g., "Project Management System" → "PMS")
- The key must be unique across all projects

---

### 4. Update Project

Updates an existing project's information.

**Endpoint:** `PUT /projects/:id`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `id`      | string | Yes      | MongoDB ObjectId of the project |

**Request Body:**

All fields are optional. Only provided fields will be updated.

| Field        | Type    | Required | Description                                  |
|--------------|---------|----------|----------------------------------------------|
| `name`       | string  | No       | New name of the project                      |
| `key`        | string  | No       | New unique key                               |
| `description`| string  | No       | New description                              |
| `owner`      | string  | No       | New owner user ID                            |
| `visibility` | string  | No       | Either "private" or "public"                 |
| `isActive`   | boolean | No       | Whether the project is active                |

**Response:** `200 OK` or `404 Not Found`

```typescript
Request Body: {
  name?: string;
  key?: string;
  description?: string;
  owner?: string;
  visibility?: "private" | "public";
  isActive?: boolean;
}

Response: {
  _id: string;
  name: string;
  key: string;
  description?: string;
  owner: string;
  visibility: "private" | "public";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example Request:**

```bash
curl -X PUT http://localhost:8082/projects/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description",
    "visibility": "public"
  }'
```

**Example Response:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Updated Project Name",
  "key": "PMS",
  "description": "Updated description",
  "owner": "user123",
  "visibility": "public",
  "isActive": true,
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-20T11:30:00.000Z"
}
```

---

### 5. Delete Project (Soft Delete)

Soft deletes a project by setting its `isActive` flag to `false`.

**Endpoint:** `DELETE /projects/:id`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `id`      | string | Yes      | MongoDB ObjectId of the project |

**Response:** `200 OK` or `404 Not Found`

```typescript
Response: {
  message: string;
  project: {
    _id: string;
    name: string;
    key: string;
    description?: string;
    owner: string;
    visibility: "private" | "public";
    isActive: boolean;    // Will be false
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Example Request:**

```bash
curl -X DELETE http://localhost:8082/projects/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

**Example Response:**

```json
{
  "message": "Project deactivated",
  "project": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Project Management System",
    "key": "PMS",
    "description": "A system for managing projects",
    "owner": "user123",
    "visibility": "private",
    "isActive": false,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-20T12:00:00.000Z"
  }
}
```

**Note:** This is a soft delete - the project is not permanently removed from the database.

---

## Configurations Endpoints

### 1. Get Configurations for Project

Retrieves all configurations associated with a specific project.

**Endpoint:** `GET /projects/:projectId/configurations`

**Authentication:** Required

**Path Parameters:**

| Parameter   | Type   | Required | Description                    |
|-------------|--------|----------|--------------------------------|
| `projectId` | string | Yes      | MongoDB ObjectId of the project |

**Response:** `200 OK`

```typescript
Response: Array<{
  _id: string;              // MongoDB ObjectId
  projectId: string;        // Reference to Project
  name: string;             // Configuration name
  description?: string;     // Optional description
  baseUrl?: string;         // Base URL for the environment
  environmentVariables?: Record<string, string>;  // Key-value pairs
  isActive: boolean;        // Whether config is active
  createdAt: Date;
  updatedAt: Date;
}>
```

**Example Request:**

```bash
curl -X GET http://localhost:8082/projects/507f1f77bcf86cd799439011/configurations \
  -H "Authorization: Bearer <token>"
```

**Example Response:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "projectId": "507f1f77bcf86cd799439011",
    "name": "Development Configuration",
    "description": "Configuration for development environment",
    "baseUrl": "http://localhost:3000",
    "environmentVariables": {
      "NODE_ENV": "development",
      "API_KEY": "dev-api-key-123",
      "DB_HOST": "localhost"
    },
    "isActive": true,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z"
  }
]
```

---

### 2. Create Configuration

Creates a new configuration for a specific project.

**Endpoint:** `POST /projects/:projectId/configurations`

**Authentication:** Required

**Path Parameters:**

| Parameter   | Type   | Required | Description                    |
|-------------|--------|----------|--------------------------------|
| `projectId` | string | Yes      | MongoDB ObjectId of the project |

**Request Body:**

| Field                  | Type                  | Required | Description                         |
|------------------------|-----------------------|----------|-------------------------------------|
| `name`                 | string                | Yes      | Name of the configuration           |
| `description`          | string                | No       | Description of the configuration    |
| `baseUrl`              | string                | No       | Base URL for the environment        |
| `environmentVariables` | Record<string,string> | No       | Key-value pairs of env variables    |

**Response:** `201 Created`

```typescript
Request Body: {
  name: string;             // Required
  description?: string;     // Optional
  baseUrl?: string;         // Optional
  environmentVariables?: Record<string, string>;  // Optional
}

Response: {
  _id: string;
  projectId: string;
  name: string;
  description?: string;
  baseUrl?: string;
  environmentVariables?: Record<string, string>;
  isActive: boolean;        // Defaults to true
  createdAt: Date;
  updatedAt: Date;
}
```

**Example Request:**

```bash
curl -X POST http://localhost:8082/projects/507f1f77bcf86cd799439011/configurations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Development Configuration",
    "description": "Configuration for development environment",
    "baseUrl": "http://localhost:3000",
    "environmentVariables": {
      "NODE_ENV": "development",
      "API_KEY": "dev-api-key-123",
      "DB_HOST": "localhost"
    }
  }'
```

**Example Response:**

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "projectId": "507f1f77bcf86cd799439011",
  "name": "Development Configuration",
  "description": "Configuration for development environment",
  "baseUrl": "http://localhost:3000",
  "environmentVariables": {
    "NODE_ENV": "development",
    "API_KEY": "dev-api-key-123",
    "DB_HOST": "localhost"
  },
  "isActive": true,
  "createdAt": "2026-01-20T10:00:00.000Z",
  "updatedAt": "2026-01-20T10:00:00.000Z"
}
```

---

## Milestones Endpoints

### 1. Get Milestones for Project

Retrieves all milestones associated with a specific project.

**Endpoint:** `GET /projects/:projectId/milestones`

**Authentication:** Required

**Path Parameters:**

| Parameter   | Type   | Required | Description                    |
|-------------|--------|----------|--------------------------------|
| `projectId` | string | Yes      | MongoDB ObjectId of the project |

**Response:** `200 OK`

```typescript
Response: Array<{
  _id: string;              // MongoDB ObjectId
  projectId: string;        // Reference to Project
  title: string;            // Milestone title
  description?: string;     // Optional description
  startDate?: Date;         // Optional start date
  dueDate?: Date;           // Optional due date
  isCompleted: boolean;     // Completion status
  createdAt: Date;
  updatedAt: Date;
}>
```

**Example Request:**

```bash
curl -X GET http://localhost:8082/projects/507f1f77bcf86cd799439011/milestones \
  -H "Authorization: Bearer <token>"
```

**Example Response:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "projectId": "507f1f77bcf86cd799439011",
    "title": "Phase 1 Completion",
    "description": "Complete the initial phase of development",
    "startDate": "2026-01-01T00:00:00.000Z",
    "dueDate": "2026-03-31T23:59:59.000Z",
    "isCompleted": false,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z"
  }
]
```

---

### 2. Create Milestone

Creates a new milestone for a specific project.

**Endpoint:** `POST /projects/:projectId/milestones`

**Authentication:** Required

**Path Parameters:**

| Parameter   | Type   | Required | Description                    |
|-------------|--------|----------|--------------------------------|
| `projectId` | string | Yes      | MongoDB ObjectId of the project |

**Request Body:**

| Field         | Type    | Required | Description                              |
|---------------|---------|----------|------------------------------------------|
| `title`       | string  | Yes      | Title of the milestone                   |
| `description` | string  | No       | Description of the milestone             |
| `startDate`   | Date    | No       | Start date (ISO 8601 format)             |
| `dueDate`     | Date    | No       | Due date (ISO 8601 format)               |
| `isCompleted` | boolean | No       | Completion status (default: false)       |

**Response:** `201 Created`

```typescript
Request Body: {
  title: string;            // Required
  description?: string;     // Optional
  startDate?: Date;         // Optional (ISO 8601)
  dueDate?: Date;           // Optional (ISO 8601)
  isCompleted?: boolean;    // Optional (default: false)
}

Response: {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  startDate?: Date;
  dueDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example Request:**

```bash
curl -X POST http://localhost:8082/projects/507f1f77bcf86cd799439011/milestones \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Phase 1 Completion",
    "description": "Complete the initial phase of development",
    "startDate": "2026-01-01T00:00:00.000Z",
    "dueDate": "2026-03-31T23:59:59.000Z"
  }'
```

**Example Response:**

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "projectId": "507f1f77bcf86cd799439011",
  "title": "Phase 1 Completion",
  "description": "Complete the initial phase of development",
  "startDate": "2026-01-01T00:00:00.000Z",
  "dueDate": "2026-03-31T23:59:59.000Z",
  "isCompleted": false,
  "createdAt": "2026-01-20T10:00:00.000Z",
  "updatedAt": "2026-01-20T10:00:00.000Z"
}
```

---

## Docker Deployment

### Build and Run with Docker Compose

1. **Build the Docker image:**

```bash
npm run docker:build
```

2. **Start the container:**

```bash
npm run docker:compose
```

3. **Or use Docker Compose directly:**

```bash
docker-compose up -d
```

The service will be available at `http://localhost:8082`.

### Docker Configuration

The service is configured to run on port **8082** in the container. You can modify the port mapping in `docker-compose.yml`.

---

## Development

### Project Structure

```
project-service/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── config/
│   │   └── index.ts             # Configuration settings
│   ├── controllers/
│   │   ├── project.controller.ts
│   │   ├── milestone.controller.ts
│   │   └── configuration.controller.ts
│   ├── models/
│   │   ├── project.model.ts
│   │   ├── milestone.model.ts
│   │   └── configuration.model.ts
│   └── routes/
│       └── project.routes.ts    # API routes
├── docker-compose.yml           # Docker compose configuration
├── Dockerfile                   # Docker image definition
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

### Available Scripts

| Script              | Description                                |
|---------------------|--------------------------------------------|
| `npm run dev`       | Start development server with hot-reload   |
| `npm run build`     | Compile TypeScript to JavaScript           |
| `npm start`         | Start production server                    |
| `npm run docker:build` | Build Docker image                      |
| `npm run docker:compose` | Start Docker container                |

### Testing with Postman

A Postman collection is available at `project-service.postman_collection.json`. 

1. Import the collection into Postman
2. Set the `authToken` variable with your JWT token
3. Update the `baseUrl` variable if needed (default: `http://localhost:3000`)
4. Start making requests!

### Error Handling

All endpoints return standard error responses:

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "message": "Project not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Error fetching projects",
  "error": "Detailed error message"
}
```

---

## License

See [LICENSE](LICENSE) file for details.

---

## Support

For issues or questions, please open an issue in the repository.
