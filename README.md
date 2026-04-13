# TaskFlow — Production-Grade Task Management API

A production-ready REST API built with Node.js, Express, PostgreSQL, and Redis. Designed for scalability, security, and maintainability.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (raw SQL with pg driver)
- **Cache**: Redis (cache-aside pattern)
- **Auth**: JWT (jsonwebtoken) + bcrypt (cost 12)
- **Logging**: Pino (structured logging)
- **Testing**: Jest + Supertest
- **Deployment**: Docker + AWS EC2

## System Design Highlights

✅ Redis cache-aside pattern (TTL: 300s)  
✅ PostgreSQL connection pooling (max: 20)  
✅ Strategic database indexes for query optimization  
✅ Graceful shutdown handling (SIGTERM)  
✅ Structured logging on every request  
✅ Rate limiting (10 req/15 min on auth routes)  
✅ Pagination with defaults  
✅ Multi-stage Docker build  
✅ Database migrations (up/down)  
✅ Automated seed data  

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 14+ (for local development)
- Redis (for local development)

### With Docker (Recommended)

```bash
# Copy env file
cp .env.example .env

# Start services
docker-compose up -d

# Migrations run automatically
# API available at http://localhost:3000
```

### Local Development

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Update .env with local PostgreSQL & Redis connection details

# Run migrations
npm run migrate:up

# Seed database
npm run seed

# Start dev server
npm run dev
```

## Project Structure

```
taskflow-pratiksha/
├── backend/
│   ├── src/
│   │   ├── config/          (db.js, redis.js, env.js)
│   │   ├── middleware/      (auth.js, errorHandler.js, logger.js, rateLimiter.js)
│   │   ├── modules/
│   │   │   ├── auth/        (register, login)
│   │   │   ├── projects/    (full CRUD + caching)
│   │   │   └── tasks/       (full CRUD + filters)
│   │   ├── utils/           (jwt.js, bcrypt.js, pagination.js)
│   │   └── app.js
├── migrations/              (SQL migration files)
├── seeds/                   (seed.sql)
├── tests/                   (integration tests)
├── postman/                 (API collection)
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
```
POST   /auth/register        Register new user
POST   /auth/login           Login and get JWT token
```

### Projects
```
GET    /projects             List all projects (paginated)
POST   /projects             Create new project
GET    /projects/:id         Get project details with tasks
PATCH  /projects/:id         Update project (owner only)
DELETE /projects/:id         Delete project (owner only)
GET    /projects/:id/stats   Task statistics (bonus)
```

### Tasks
```
GET    /projects/:id/tasks   List project tasks (with filters)
POST   /projects/:id/tasks   Create new task
PATCH  /tasks/:id            Update task
DELETE /tasks/:id            Delete task
```

## Authentication

All endpoints except `/auth/*` require JWT authentication:

```
Authorization: Bearer <your_jwt_token>
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

## Docker Commands

```bash
# Build image
npm run docker:build

# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
docker-compose logs -f backend
```

## Environment Variables

See `.env.example` for all configuration options.

**Critical**: Never commit `.env` files. Always use `.env.example` as template.

## Error Handling

Standard error response format:

```json
{
  "error": "error message",
  "fields": { "fieldName": "error details" }
}
```

## Security Features

- Passwords hashed with bcrypt (cost 12)
- JWT tokens expire after 24 hours
- Rate limiting on sensitive endpoints
- Parameterized SQL queries (prevent SQL injection)
- CORS headers configured
- Request logging for audit trails

## Deployment

### AWS EC2
1. Build Docker image: `npm run docker:build`
2. Push to ECR or Docker Hub
3. SSH into EC2 instance
4. Pull image and run: `docker run -d -p 80:3000 taskflow:latest`
5. Use environment variables from `.env`

### Health Check
```
GET /health (if implemented)
```

## Monitoring & Logging

All requests logged with pino:

```json
{
  "timestamp": "2024-04-12T10:30:45.123Z",
  "level": "info",
  "method": "POST",
  "url": "/auth/login",
  "statusCode": 200,
  "responseTime": 245
}
```

## Future Enhancements

- [ ] WebSocket support for real-time task updates
- [ ] Task comments and activity log
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Email notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the code style (ESLint)
4. Add tests for new features
5. Submit pull request

## License

MIT

---

Built with ❤️ for production systems.
