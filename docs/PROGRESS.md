# Talab Progress

## Current version: v0.6.0

### Customer experience
- Premium RTL mobile-first registration, login and customer dashboard.
- HttpOnly/SameSite session cookie; no browser localStorage token.
- Status badges use icon + text and accessible focus/touch states.
- Requests, unread notifications, attachments, loading/error/empty/success states.
- Dedicated terms/privacy and 404 pages.

### Backend and security
- FastAPI + async PostgreSQL + Alembic migration verification.
- Argon2 portal password hash + AES-GCM service credential encryption.
- Audited admin credential reveal.
- Login/register rate limiting.
- Private customer-authorized attachment download.
- Validated image/video/document uploads up to configured size.
- Admin status, notification and service-management APIs with audit trail.

### Telegram administration
- Owner-only request management.
- Activate/reject/suspend actions.
- Ephemeral credential reveal.
- Text notifications plus image/video/document upload directly from Telegram.
- Service listing and creation.

### Product quality
- `design-system/talab/MASTER.md` is the visual source of truth using UI/UX Pro Max priorities.
- GitHub Actions checks TypeScript, Next.js build, Python compilation/tests and PostgreSQL migrations.
- systemd/Nginx deployment templates and production guide included.

## Remaining before public launch
- Configure real domain, server secrets and Telegram credentials.
- Run full deployed browser E2E flow and visual review on real phones/desktop.
- Add Redis-backed rate limiting only if running multiple API workers.
- Add database/media backup automation and retention policy.
