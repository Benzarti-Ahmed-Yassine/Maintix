# Alembic Migrations

This folder is reserved for Alembic migration scripts.

## Usage

- `alembic revision --autogenerate -m "create tables"`
- `alembic upgrade head`

## Notes

Migration scripts should be created after domain models are defined in `maintix_backend/models`.
