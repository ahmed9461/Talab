# Talab Production Deployment

Target: Ubuntu 24.04, `/opt/Talab`, PostgreSQL, systemd and Nginx.

## Production topology
- `portal.example.com` → Next.js on `127.0.0.1:3000`
- `api.example.com` → FastAPI on `127.0.0.1:8000`
- PostgreSQL local/private
- Telegram bot talks to the local admin API only

Use two subdomains under the same parent domain so the secure SameSite session cookie works predictably.

## Required production environment
Backend `.env` must use strong independent random secrets and at minimum:
- `DATABASE_URL`
- `CREDENTIAL_ENCRYPTION_KEY`
- `JWT_SECRET`
- `ADMIN_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_OWNER_ID`
- `FRONTEND_ORIGIN=https://portal.example.com`
- `PUBLIC_BASE_URL=https://api.example.com`
- `COOKIE_SECURE=true`

Frontend `.env.production`:
- `NEXT_PUBLIC_API_URL=https://api.example.com/api/v1`

Never copy values from `.env.example` into production unchanged.

## Build order
1. Create a dedicated `talab` Linux user and clone the repository to `/opt/Talab`.
2. Create `backend/.venv`, install `backend/requirements.txt`, configure backend `.env`.
3. Create PostgreSQL database/user and run `alembic upgrade head` from `backend/`.
4. Run `npm install` and `npm run build` from the repository root.
5. Copy systemd units from `deploy/`, reload systemd and enable/start API, web and bot.
6. Configure Nginx using `deploy/nginx.conf.example`, replacing example domains.
7. Add HTTPS certificates, then keep `COOKIE_SECURE=true`.
8. Verify `/health`, registration, login, status update, notification and attachment download end-to-end.

## Uploads and backups
`MEDIA_ROOT` stores notification media on disk. Back it up together with PostgreSQL. Attachments are downloaded through an authenticated customer endpoint rather than a public static directory.

## Security notes
- Admin API is not exposed to the browser and requires `X-Admin-Key`.
- Credential reveal is audit-logged.
- Login and registration have lightweight per-process rate limits. For multiple API workers, replace this with Redis-backed throttling.
- Run only one bot polling process.
