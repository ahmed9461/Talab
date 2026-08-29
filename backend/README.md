# Talab Backend

FastAPI + PostgreSQL backend for Talab.

## Local setup

1. Start PostgreSQL from the repository root: `docker compose up -d postgres`
2. Create a virtual environment and install `backend/requirements.txt`.
3. Copy `backend/.env.example` to `backend/.env` and replace both secrets with long random values.
4. Create the initial schema through Alembic migrations (next implementation step).
5. Run from `backend/`: `uvicorn app.main:app --reload`

## Current API
- `GET /health`
- `GET /api/v1/services`
- `POST /api/v1/auth/register`

Registration creates the customer, pending service request, terms acceptance, and encrypted service credentials in one transaction.

## Security rule
The password is hashed with Argon2 for portal authentication and separately encrypted with AES-GCM only because the same submitted credential is currently required to perform the requested external service. The encryption key must never be committed to Git.
