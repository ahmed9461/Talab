import os
os.environ.setdefault("CREDENTIAL_ENCRYPTION_KEY","test-encryption-key")
os.environ.setdefault("JWT_SECRET","test-jwt-secret")
from app.security import encrypt_service_password,decrypt_service_password,hash_portal_password,verify_portal_password,create_access_token,decode_access_token
def test_encryption_roundtrip():
    encrypted=encrypt_service_password("secret123"); assert encrypted!="secret123"; assert decrypt_service_password(encrypted)=="secret123"
def test_password_hash():
    h=hash_portal_password("secret123"); assert verify_portal_password("secret123",h); assert not verify_portal_password("wrong",h)
def test_token_roundtrip():
    token=create_access_token("11111111-1111-1111-1111-111111111111"); assert decode_access_token(token)["sub"]=="11111111-1111-1111-1111-111111111111"
