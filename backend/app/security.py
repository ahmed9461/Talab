import base64
import hashlib
import hmac
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from passlib.hash import argon2

from app.config import get_settings


def _key() -> bytes:
    raw = get_settings().credential_encryption_key.encode("utf-8")
    return hashlib.sha256(raw).digest()


def encrypt_service_password(value: str) -> str:
    nonce = os.urandom(12)
    encrypted = AESGCM(_key()).encrypt(nonce, value.encode("utf-8"), None)
    return base64.urlsafe_b64encode(nonce + encrypted).decode("ascii")


def decrypt_service_password(value: str) -> str:
    payload = base64.urlsafe_b64decode(value.encode("ascii"))
    return AESGCM(_key()).decrypt(payload[:12], payload[12:], None).decode("utf-8")


def hash_portal_password(value: str) -> str:
    return argon2.hash(value)


def verify_portal_password(value: str, password_hash: str) -> bool:
    return argon2.verify(value, password_hash)
