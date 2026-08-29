import uuid
from fastapi import Depends,Header,HTTPException
from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import get_settings
from app.database import get_db
from app.models import Customer
from app.security import decode_access_token
bearer=HTTPBearer(auto_error=False)
async def current_customer(credentials:HTTPAuthorizationCredentials=Depends(bearer),db:AsyncSession=Depends(get_db)):
    if not credentials: raise HTTPException(401,"تسجيل الدخول مطلوب")
    try: customer_id=uuid.UUID(decode_access_token(credentials.credentials)["sub"])
    except Exception: raise HTTPException(401,"الجلسة غير صالحة")
    customer=await db.get(Customer,customer_id)
    if not customer: raise HTTPException(401,"الحساب غير موجود")
    return customer
async def require_admin(x_admin_key:str|None=Header(default=None)):
    if not x_admin_key or x_admin_key!=get_settings().admin_api_key: raise HTTPException(401,"صلاحية الإدارة مطلوبة")
    return True
