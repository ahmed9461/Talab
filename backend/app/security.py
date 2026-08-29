import base64
import hashlib
import os
from datetime import datetime, timedelta, timezone

import jwt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from passlib.hash import argon2

from app.config import get_settings


def _credential_key() -> bytes:
    return hashlib.sha256(get_settings().credential_encryption_key.encode("utf-8")).digest()


def encrypt_service_password(value: str) -> str:
    nonce = os.urandom(12)
    encrypted = AESGCM(_credential_key()).encrypt(nonce, value.encode("utf-8"), None)
    return base64.urlsafe_b64encode(nonce + encrypted).decode("ascii")


def decrypt_service_password(value: str) -> str:
    payload = base64.urlsafe_b64decode(value.encode("ascii"))
    return AESGCM(_credential_key()).decrypt(payload[:12], payload[12:], None).decode("utf-8")


def hash_portal_password(value: str) -> str:
    return argon2.hash(value)


def verify_portal_password(value: str, password_hash: str) -> bool:
    return argon2.verify(value, password_hash)


def create_access_token(customer_id: str) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"sub": str(customer_id), "iat": now, "exp": now + timedelta(days=settings.session_days)},
        settings.jwt_secret,
        algorithm="HS256",
    )


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, get_settings().jwt_secret, algorithms=["HS256"])
