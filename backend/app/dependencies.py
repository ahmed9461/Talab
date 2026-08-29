import secrets
import uuid

from fastapi import Cookie, Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models import Customer
from app.security import decode_access_token

bearer = HTTPBearer(auto_error=False)


async def current_customer(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    session_cookie: str | None = Cookie(default=None, alias="talab_session"),
    db: AsyncSession = Depends(get_db),
):
    token = credentials.credentials if credentials else session_cookie
    if not token:
        raise HTTPException(401, "تسجيل الدخول مطلوب")
    try:
        customer_id = uuid.UUID(decode_access_token(token)["sub"])
    except Exception as exc:
        raise HTTPException(401, "الجلسة غير صالحة") from exc
    customer = await db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(401, "الحساب غير موجود")
    return customer


async def require_admin(x_admin_key: str | None = Header(default=None)) -> bool:
    expected = get_settings().admin_api_key
    if not x_admin_key or not secrets.compare_digest(x_admin_key, expected):
        raise HTTPException(401, "صلاحية الإدارة مطلوبة")
    return True
