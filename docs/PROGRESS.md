# Talab Progress

## Current version: v0.5.0

### Customer experience
- Professional RTL, mobile-first registration experience using the Talab master design system.
- Login using an HttpOnly session cookie instead of browser localStorage.
- Customer dashboard with account status, requests, unread notification count, attachments, and read state.
- Dedicated terms/privacy page and custom 404 page.
- Visible loading, empty, success, error and focus states.

### Backend
- FastAPI + async PostgreSQL + Alembic.
- Registration with terms acceptance and PENDING request.
- Argon2 portal password hash plus AES-GCM reversible service credential encryption.
- JWT session stored in an HttpOnly/SameSite cookie.
- Customer profile, request and notification APIs.
- Admin API protected by a separate admin key.
- Status changes, notifications, attachment metadata and admin audit log.
- Audited admin-only credential reveal.
- Service create/update/disable API.

### Telegram administration
- Owner-only bot.
- Request list with activate/reject/suspend actions.
- Ephemeral credential reveal through callback alert.
- Notification composition flow.
- Service listing and creation commands.

### Quality
- Persistent design system at `design-system/talab/MASTER.md` based on UI/UX Pro Max priority rules.
- CI validates TypeScript/Next.js build, Python compilation/tests and PostgreSQL migration up/down/up.
- Local PostgreSQL Docker Compose configuration.

## Remaining before public production
- Configure real deployment secrets, domain, HTTPS and `COOKIE_SECURE=true`.
- Add binary media storage/upload rather than URL metadata only.
- Add request throttling/login rate limits and optional CSRF token if frontend/API are deployed cross-site.
- Add Telegram media upload flow and richer service management buttons.
- Run end-to-end browser tests against the deployed environment.
