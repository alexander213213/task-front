# Task Marketplace Demo

A full-stack web application that simulates the core lifecycle of a task marketplace.

Users can post tasks, submit proposals, assign workers, submit completed work, and finalize tasks with ratings and reviews.

This project was built as a **portfolio demonstration** to showcase practical full-stack development skills through a realistic product workflow rather than a simple CRUD application.

The system focuses on **state-driven task lifecycle management, backend data integrity, and structured frontend interaction flows.**

---

# Demo Scope

This project intentionally focuses on the **core marketplace lifecycle**.

The goal is to demonstrate:

- backend workflow design
- authenticated API architecture
- data integrity and transactional updates
- realistic product state transitions
- modular frontend UI implementation

Some features that would normally exist in production platforms were **intentionally deferred** to fit the project timeline.

Deferred features include:

- real-time updates via **Server-Sent Events**
- **direct chat** between task owners and taskers
- push notification systems

Despite these omissions, the application fully demonstrates the engineering decisions required to build a functioning task marketplace.

---

# Demo Accounts and Seed Data

The demo environment is automatically populated with **seed data** to make it easier to explore the platform and test different workflows.

The seed data includes:

- multiple users
- tasks in different lifecycle states
- proposals
- reviews and ratings

For convenience, **all demo users use the same password**:

```
Password123!
```

You can log in using any seeded account to explore both the task owner and tasker workflows.

---

# Core Task Lifecycle

The platform models tasks as a controlled workflow instead of allowing arbitrary updates.

```
OPEN → ASSIGNED → SUBMITTED → COMPLETED
```

Supported transitions include:

| From | To | Description |
|-----|-----|-------------|
| OPEN | ASSIGNED | Owner selects a worker |
| ASSIGNED | SUBMITTED | Worker submits completed work |
| SUBMITTED | COMPLETED | Owner confirms completion |
| OPEN | CANCELLED | Owner cancels task |
| ASSIGNED/SUBMITTED | OPEN | Owner reopens task |

Reviews are only allowed after a task reaches **COMPLETED**.

---

# Features

## Authentication

- JWT-based authentication
- refresh-token session flow
- protected API routes

## Task Management

- create and manage tasks
- reward and deadline system
- task browsing and filtering

## Proposal System

- taskers can submit proposals
- task owners review proposals
- owners assign a worker

## Task Progression

- worker submission flow
- owner confirmation flow
- lifecycle enforcement

## Review System

- ratings and comments
- restricted to completed tasks

## Backend Safety

- guarded lifecycle transitions
- schema validation using Zod
- transactional updates for rating and review logic

## Frontend

- Vue + TypeScript UI
- form validation and dialogs
- drawer-based task views
- responsive layout

---

# Tech Stack

## Frontend

- Vue 3
- TypeScript
- Vite
- Naive UI

## Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL

## Infrastructure / Utilities

- JWT authentication
- Zod validation
- cursor-based pagination

---

# System Architecture

The application follows a typical **client–server architecture**.

The frontend communicates with a REST API built using Express.  
The backend handles authentication, business logic, and task lifecycle enforcement while persisting data using Prisma ORM with PostgreSQL.

```
Client (Vue App)
        │
        │ HTTP JSON API
        ▼
Express Server
        │
        ├── Authentication Layer
        ├── Request Validation (Zod)
        ├── Task Lifecycle Logic
        └── Database Access (Prisma)
                │
                ▼
           PostgreSQL
```

This structure keeps the application modular and easier to maintain.

---

# Architecture Highlights

## Lifecycle-driven design

Tasks follow strict state transitions to prevent invalid actions.  
For example, a task cannot be marked as completed unless it has first been submitted.

## Transactional updates

Operations involving reviews and ratings run inside database transactions to ensure data consistency.

## Validation layer

All incoming API requests are validated using **Zod schemas** before reaching the application logic.

## Separation of concerns

The backend separates:

- route handlers
- validation
- database services
- business logic

This structure helps keep the codebase maintainable and easier to extend.

---

# Example API Request

Create a new task:

```
POST /tasks
```

Request body:

```json
{
  "title": "Pick up groceries",
  "description": "Buy items from the list",
  "reward": 300,
  "deadline": "2026-04-01T10:00:00Z"
}
```

Example response:

```json
{
  "id": "task_123",
  "title": "Pick up groceries",
  "status": "OPEN",
  "reward": 300,
  "deadline": "2026-04-01T10:00:00Z"
}
```

---

# Project Structure

Example structure:

```
backend/
  src/
    routes/
    controllers/
    services/
    middleware/
    schemas/
    utils/

frontend/
  src/
    components/
    views/
    api/
    composables/
    router/
```

---

# Screenshots

## Landing Page
![Landing Page](./screenshots/landing.png)

## Task Feed
![Task Feed](./screenshots/tasks.png)

## Task Details
![Task Details](./screenshots/task-details.png)

---

# Running the Project

## Prerequisites

- Node.js 18+
- PostgreSQL
- npm or pnpm

---

## Backend Setup

```
cd backend
npm install
cp .env.example .env
```

Configure your database connection in `.env`.

Run database migrations:

```
npx prisma migrate dev
```

Start the backend server:

```
npm run dev
```

---

## Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

# Future Improvements

Planned improvements include:

- Server-Sent Events for real-time task updates
- direct messaging between task owners and taskers
- notification system for workflow changes
- improved UI/UX polish
- production deployment configuration

---

# Why This Project Exists

This project was built to demonstrate the ability to:

- design a realistic product workflow
- implement backend state logic
- coordinate frontend and backend behavior
- build a structured full-stack application from scratch

Rather than focusing only on CRUD endpoints, the application models **real system behavior and constraints** commonly found in marketplace platforms.

---

# Author

Alexander Gracilla  
Full-Stack Developer