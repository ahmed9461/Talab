from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models import Customer, Service, ServiceCredential, ServiceRequest, TermsAcceptance
from app.rate_limit import enforce_rate_limit
from app.schemas import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from app.security import create_access_token, encrypt_service_password, hash_portal_password, verify_portal_password

router = APIRouter()
TERMS_VERSION = "1.0"


def client_key(request: Request, action: str) -> str:
    host = request.client.host if request.client else "unknown"
    return f"{action}:{host}"


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)) -> RegisterResponse:
    enforce_rate_limit(client_key(request, "register"), limit=5, window_seconds=300)
    username = payload.username.strip().lower()
    existing = await db.scalar(select(Customer).where(Customer.username == username))
    if existing:
        raise HTTPException(409, "اسم المستخدم مستخدم بالفعل")

    if payload.service_id:
        service = await db.scalar(select(Service).where(Service.id == payload.service_id, Service.is_active.is_(True)))
        if not service:
            raise HTTPException(400, "الخدمة المحددة غير متاحة")

    customer = Customer(full_name=payload.full_name.strip(), username=username, phone=payload.phone.strip(), portal_password_hash=hash_portal_password(payload.password))
    db.add(customer)
    await db.flush()
    service_request = ServiceRequest(customer_id=customer.id, service_id=payload.service_id, custom_service_text=(payload.custom_service_text or "").strip() or None)
    db.add(service_request)
    await db.flush()
    db.add(ServiceCredential(request_id=service_request.id, service_username=payload.username.strip(), encrypted_password=encrypt_service_password(payload.password)))
    db.add(TermsAcceptance(customer_id=customer.id, terms_version=TERMS_VERSION))
    await db.commit()
    return RegisterResponse(customer_id=customer.id, request_id=service_request.id, status=service_request.status.value)


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, request: Request, response: Response, db: AsyncSession = Depends(get_db)) -> LoginResponse:
    enforce_rate_limit(client_key(request, "login"), limit=10, window_seconds=300)
    customer = await db.scalar(select(Customer).where(Customer.username == payload.username.strip().lower()))
    if not customer or not verify_portal_password(payload.password, customer.portal_password_hash):
        raise HTTPException(401, "اسم المستخدم أو كلمة المرور غير صحيحة")

    settings = get_settings()
    response.set_cookie(
        key=settings.session_cookie_name,
        value=create_access_token(str(customer.id)),
        max_age=settings.session_days * 86400,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )
    return LoginResponse()


@router.post("/logout", response_model=LoginResponse)
async def logout(response: Response) -> LoginResponse:
    settings = get_settings()
    response.delete_cookie(key=settings.session_cookie_name, path="/", samesite="lax")
    return LoginResponse()
