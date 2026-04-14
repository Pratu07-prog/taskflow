# TaskFlow - Backend Engineering Take-Home Submission

## 1. Overview

TaskFlow is a backend task management API built for the Zomato Greening India Tech take-home assignment. It supports user registration and login, project management, task CRUD operations, filtering, JWT-protected routes, SQL migrations, seed data, Docker-based local setup, and Swagger/Postman API documentation.

This submission is for the `Backend Engineer` track, so the deliverable is the API plus database, Docker setup, seed data, and API documentation rather than a React frontend.

### Tech stack

- Node.js 18
- Express.js
- PostgreSQL
- Raw SQL via `pg`
- JWT authentication with `jsonwebtoken`
- Password hashing with `bcrypt`
- Structured logging with `winston`
- Swagger UI for API docs
- Postman collection for endpoint testing
- Docker and Docker Compose

### Hosted deployment

- AWS deployment URL: `http://13.236.146.101/docs/`

## 2. Architecture Decisions

The project is organized around a simple layered backend structure:

- `routes` handle route registration and middleware composition
- `controllers` handle HTTP validation, status codes, and request/response mapping
- `services` contain database-facing business logic
- `config` centralizes environment loading and PostgreSQL setup
- `middleware` contains auth, logging, error handling, and rate limiting
- `migrations` and `seeds` live at the repo root so they can be run independently of the app server

### Why this structure

- I used raw SQL instead of an ORM to keep the schema, joins, and query behavior explicit.
- I separated controllers from services so HTTP concerns stay distinct from persistence logic.
- I kept PostgreSQL as the single source of truth and used migrations instead of schema sync or auto-migrate behavior.
- I added Swagger and a Postman collection to make review easier for a backend-only submission.

### Tradeoffs and what I intentionally left out

- I chose Node.js/Express instead of Go so I could complete the scope confidently within the assignment window.
- I focused on the core API, schema, auth, Docker workflow, and developer experience over broader feature depth.
- Integration test files are scaffolded, but full endpoint coverage is still a follow-up item.
- There is no frontend in this repo because this submission targets the backend role.

## 3. Running Locally

Assumption: the reviewer has Docker installed and nothing else.

```bash
git clone https://github.com/Pratu07-prog/taskflow.git
cd taskflow
cp .env.example .env
docker compose up --build -d
docker compose exec backend npm run migrate:up
docker compose exec backend npm run seed
```

API base URL:

- `http://localhost:3000`

Swagger docs:

- `http://localhost:3000/docs`

Health check:

- `http://localhost:3000/health`

### Notes

- `docker compose up` starts PostgreSQL and the backend container.
- Migrations and seed data are run explicitly so the startup path stays predictable.
- If Docker Compose creates the project directory name differently on your machine, use `docker compose ps` to confirm the backend container is running before executing migration commands.

## 4. Running Migrations

Migrations do not auto-run on container startup in this submission. Run them with the following exact commands:

```bash
docker compose exec backend npm run migrate:up
```

To roll them back:

```bash
docker compose exec backend npm run migrate:down
```

To seed demo data:

```bash
docker compose exec backend npm run seed
```

## 5. Test Credentials

After running the seed command, use:

```text
Email:    john@example.com
Password: TestPass123
```

## 6. API Reference

Two options are included in the repo:

- Swagger UI: `http://localhost:3000/docs`
- Postman collection: `postman/taskflow.json`

### Core endpoints

Authentication

- `POST /auth/register`
- `POST /auth/login`

Projects

- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`
- `GET /projects/:id/stats`

Tasks

- `GET /projects/:id/tasks`
- `POST /projects/:id/tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

### Example validation error

```json
{
  "error": "validation failed",
  "fields": {
    "email": "is required"
  }
}
```

## 7. What I'd Do With More Time

- Add real integration tests for auth, projects, and tasks instead of only keeping the current Jest scaffolding.
- Add migration tracking so schema changes can run automatically and safely on startup.
- Strengthen seed/data setup for multiple environments and add a cleanup/reset workflow.
- Improve observability with request IDs, better structured logs, and container-ready log formatting.
- Add pagination metadata consistently across all list endpoints and document it more thoroughly.
- Extend the API with comments, activity history, and collaborator roles.

## Additional Submission Notes

### Repo structure

This repository contains:

- `backend/` for the Express application
- `migrations/` for SQL up/down migrations
- `seeds/` for seed data
- `postman/` for API collection
- `docker-compose.yml` at the repo root

### Secrets

- `.env` is ignored and should not be committed.
- Before submission, make sure no real database passwords, JWT secrets, or AWS credentials are present in Git history.
- If any real credentials were ever committed, rotate them before sending the repository link.

### Submission checklist

1. Push the final code to a public GitHub repository.
2. Prefer naming the repo `taskflow-pratiksha` to match the assignment format `taskflow-[your-name]`.
3. Replace `REPLACE_WITH_YOUR_EC2_PUBLIC_URL` in this README with your live AWS URL.
4. Verify these commands work from a clean clone: `cp .env.example .env`, `docker compose up --build -d`, `docker compose exec backend npm run migrate:up`, `docker compose exec backend npm run seed`.
5. Open `http://localhost:3000/docs` and confirm the API documentation loads.
6. Reply to the assignment email with the public GitHub repository URL before the deadline.

### Suggested submission email

```text
Subject: TaskFlow Backend Assignment Submission - Pratiksha Vikharankar

Hi Rishabh,

Please find my submission for the TaskFlow backend take-home assignment below:

GitHub Repository: https://github.com/Pratu07-prog/taskflow

The README includes setup instructions, seed credentials, API documentation details, and architecture notes.

Thanks,
Pratiksha Vikharankar
```
