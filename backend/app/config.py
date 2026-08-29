from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://talab:talab@localhost:5432/talab"
    credential_encryption_key: str
    jwt_secret: str
    frontend_origin: str = "http://localhost:3000"
    public_base_url: str = "http://localhost:8000"
    admin_api_key: str = "change-me"
    telegram_bot_token: str = ""
    telegram_owner_id: int = 0
    session_cookie_name: str = "talab_session"
    session_days: int = 7
    cookie_secure: bool = False
    expose_docs: bool = True
    media_root: str = "media"
    max_upload_bytes: int = 50_000_000
    backup_retention_days: int = 14

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
