# Talab Progress

## Implemented
- RTL mobile-first Next.js registration, login and customer dashboard.
- Dynamic services + Other flow.
- FastAPI + async PostgreSQL + Alembic initial migration and service seed.
- Customer registration, terms acceptance and PENDING request.
- Argon2 portal authentication plus AES-GCM reversible service credential storage.
- JWT customer sessions.
- Customer profile, requests and notifications APIs.
- Notifications, attachments and read-state database model.
- Admin API protected by separate admin key.
- Admin request listing and ACTIVE/REJECTED/SUSPENDED status changes with audit logging.
- Admin-created customer notifications with optional attachment metadata.
- Owner-only Telegram admin bot with request list and inline status controls.
- Local PostgreSQL Docker Compose and security unit tests.

## Remaining before production
- Run migrations and integration tests against a real PostgreSQL instance.
- Add production reverse proxy/HTTPS and systemd or containers.
- Configure real Telegram token/owner ID and deployment secrets.
- Add actual binary media upload/storage provider; API currently stores attachment metadata/URL.
- Expand bot UI for composing notifications/media and service CRUD.
- Add refresh/session revocation and rate limiting before exposing publicly.
