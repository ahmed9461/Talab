from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Customer, Service, ServiceCredential, ServiceRequest, TermsAcceptance
from app.schemas import RegisterRequest, RegisterResponse
from app.security import encrypt_service_password, hash_portal_password

router = APIRouter()
TERMS_VERSION = "1.0"


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> RegisterResponse:
    existing = await db.scalar(select(Customer).where(Customer.username == payload.username.lower()))
    if existing:
        raise HTTPException(status_code=409, detail="اسم المستخدم مستخدم بالفعل")

    if payload.service_id:
        service = await db.scalar(select(Service).where(Service.id == payload.service_id, Service.is_active.is_(True)))
        if not service:
            raise HTTPException(status_code=400, detail="الخدمة المحددة غير متاحة")

    customer = Customer(
        full_name=payload.full_name.strip(),
        username=payload.username.lower(),
        phone=payload.phone.strip(),
        portal_password_hash=hash_portal_password(payload.password),
    )
    db.add(customer)
    await db.flush()

    request = ServiceRequest(
        customer_id=customer.id,
        service_id=payload.service_id,
        custom_service_text=(payload.custom_service_text or "").strip() or None,
    )
    db.add(request)
    await db.flush()

    db.add(ServiceCredential(
        request_id=request.id,
        service_username=payload.username,
        encrypted_password=encrypt_service_password(payload.password),
    ))
    db.add(TermsAcceptance(customer_id=customer.id, terms_version=TERMS_VERSION))
    await db.commit()

    return RegisterResponse(customer_id=customer.id, request_id=request.id, status=request.status.value)
