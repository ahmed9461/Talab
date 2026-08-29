from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Customer,Service,ServiceCredential,ServiceRequest,TermsAcceptance
from app.schemas import RegisterRequest,RegisterResponse,LoginRequest,LoginResponse
from app.security import encrypt_service_password,hash_portal_password,verify_portal_password,create_access_token
router=APIRouter(); TERMS_VERSION="1.0"
@router.post("/register",response_model=RegisterResponse,status_code=status.HTTP_201_CREATED)
async def register(payload:RegisterRequest,db:AsyncSession=Depends(get_db)):
    existing=await db.scalar(select(Customer).where(Customer.username==payload.username.lower()))
    if existing: raise HTTPException(409,"اسم المستخدم مستخدم بالفعل")
    if payload.service_id:
        service=await db.scalar(select(Service).where(Service.id==payload.service_id,Service.is_active.is_(True)))
        if not service: raise HTTPException(400,"الخدمة المحددة غير متاحة")
    customer=Customer(full_name=payload.full_name.strip(),username=payload.username.lower(),phone=payload.phone.strip(),portal_password_hash=hash_portal_password(payload.password)); db.add(customer); await db.flush()
    req=ServiceRequest(customer_id=customer.id,service_id=payload.service_id,custom_service_text=(payload.custom_service_text or "").strip() or None); db.add(req); await db.flush()
    db.add(ServiceCredential(request_id=req.id,service_username=payload.username,encrypted_password=encrypt_service_password(payload.password))); db.add(TermsAcceptance(customer_id=customer.id,terms_version=TERMS_VERSION)); await db.commit()
    return RegisterResponse(customer_id=customer.id,request_id=req.id,status=req.status.value)
@router.post("/login",response_model=LoginResponse)
async def login(payload:LoginRequest,db:AsyncSession=Depends(get_db)):
    customer=await db.scalar(select(Customer).where(Customer.username==payload.username.lower()))
    if not customer or not verify_portal_password(payload.password,customer.portal_password_hash): raise HTTPException(401,"اسم المستخدم أو كلمة المرور غير صحيحة")
    return LoginResponse(access_token=create_access_token(customer.id))
