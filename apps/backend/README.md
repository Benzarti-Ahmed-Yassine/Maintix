# Maintix Backend Architecture

This repository contains the FastAPI backend architecture scaffold for Maintix.

## Purpose

This scaffold provides a clean separation of concerns for a decision intelligence backend:

- API layer with route definitions and request lifecycle
- Service layer for business orchestration
- Repository layer for persistence access
- Domain layer for entity definitions and domain events
- Dependency injection for infrastructure and security
- Background workers for event processing and MQTT/Redis handling
- Middleware for auth, logging, and request shaping
- DTOs and Pydantic schemas for API contracts and transport

## Architecture

- FastAPI for HTTP and WebSocket application
- SQLAlchemy ORM for TimescaleDB/PostgreSQL models
- Alembic for database migrations
- JWT for authentication and authorization
- Redis for cache, pub/sub, and background coordination
- MQTT for industrial asset and telemetry integration
- WebSocket for live event updates and digital twin data

## Folder structure

- `maintix_backend/api` - API route definitions and routers
- `maintix_backend/core` - infrastructure, security, messaging, events, middleware
- `maintix_backend/db` - SQLAlchemy session, engine, and migration helpers
- `maintix_backend/models` - domain models and ORM entities
- `maintix_backend/repositories` - data access repositories
- `maintix_backend/services` - use case orchestration and application services
- `maintix_backend/schemas` - Pydantic request/response schemas
- `maintix_backend/workers` - background workers and scheduled tasks
- `maintix_backend/dependencies` - DI providers for app dependencies
- `maintix_backend/operations` - startup/shutdown lifecycle and event bus wiring

## Getting started

1. Create a virtual environment.
2. Install dependencies: `pip install -e .`
3. Configure environment variables in `.env`.
4. Run the app: `uvicorn maintix_backend.main:app --reload`

## Notes

This scaffold defines architecture only and intentionally omits endpoint implementation details.
