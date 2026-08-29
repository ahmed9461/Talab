#!/usr/bin/env bash
set -euo pipefail

ROOT="/opt/Talab"
BACKUP_DIR="$ROOT/backups"
STAMP="$(date +%Y%m%d_%H%M%S)"
RETENTION="${BACKUP_RETENTION_DAYS:-14}"
mkdir -p "$BACKUP_DIR"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set" >&2
  exit 1
fi

PG_URL="${DATABASE_URL/postgresql+asyncpg:/postgresql:}"
pg_dump "$PG_URL" | gzip -9 > "$BACKUP_DIR/database_${STAMP}.sql.gz"

if [[ -d "$ROOT/backend/${MEDIA_ROOT:-media}" ]]; then
  tar -C "$ROOT/backend" -czf "$BACKUP_DIR/media_${STAMP}.tar.gz" "${MEDIA_ROOT:-media}"
fi

find "$BACKUP_DIR" -type f -mtime "+$RETENTION" -delete
