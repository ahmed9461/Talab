import base64, hashlib, os
from datetime import datetime, timedelta, timezone
import jwt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from passlib.hash import argon2
from app.config import get_settings

def _key(): return hashlib.sha256(get_settings().credential_encryption_key.encode()).digest()
def encrypt_service_password(value):
    nonce=os.urandom(12); encrypted=AESGCM(_key()).encrypt(nonce,value.encode(),None); return base64.urlsafe_b64encode(nonce+encrypted).decode()
def decrypt_service_password(value):
    payload=base64.urlsafe_b64decode(value.encode()); return AESGCM(_key()).decrypt(payload[:12],payload[12:],None).decode()
def hash_portal_password(value): return argon2.hash(value)
def verify_portal_password(value,password_hash): return argon2.verify(value,password_hash)
def create_access_token(customer_id):
    now=datetime.now(timezone.utc); return jwt.encode({"sub":str(customer_id),"iat":now,"exp":now+timedelta(days=7)},get_settings().jwt_secret,algorithm="HS256")
def decode_access_token(token): return jwt.decode(token,get_settings().jwt_secret,algorithms=["HS256"])
