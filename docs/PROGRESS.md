# Talab Progress

## Current version: v0.7.0

### Customer experience
- Premium RTL mobile-first registration, login and customer dashboard.
- HttpOnly/SameSite session cookie; no browser localStorage token.
- Status badges use icon + text and accessible focus/touch states.
- Requests, unread notifications, private attachments, loading/error/empty/success states.
- Dedicated terms/privacy and 404 pages plus application icon.

### Backend and security
- FastAPI + async PostgreSQL + Alembic migrations.
- Argon2 portal password hash + AES-GCM service credential encryption.
- Login timestamp and terms acceptance context (version/IP/user agent).
- Audited admin credential reveal.
- Login/register rate limiting.
- Private customer-authorized attachment download.
- Validated image/video/document uploads up to configured size.
- Admin status, notification and service-management APIs with audit trail.
- Production option to disable API documentation.

### Telegram administration
- Owner-only request management.
- Automatic owner notification immediately after successful registration.
- Activate/reject/suspend/disable actions.
- Ephemeral credential reveal.
- Text notifications plus image/video/document upload directly from Telegram.
- Service listing, creation, enable and disable controls.

### Product quality and operations
- `design-system/talab/MASTER.md` is the visual source of truth using UI/UX Pro Max priorities.
- GitHub Actions checks TypeScript, Next.js build, Python compilation/tests and PostgreSQL migrations.
- Browser smoke suite runs registration/dashboard at desktop and mobile widths and checks horizontal overflow.
- CI retains temporary screenshots/HTML Playwright report for visual inspection.
- Public Nginx blocks the admin API path.
- systemd/Nginx deployment templates and production guide included.
- Daily PostgreSQL/media backup timer with configurable retention.

## Remaining before public launch
- Configure the actual domain, production server secrets and Telegram credentials.
- Deploy and perform a final real-environment E2E review.
- Use Redis-backed rate limiting only if running multiple API workers.
