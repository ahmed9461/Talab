from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models import AdminAction, Customer, Notification, NotificationAttachment, RequestStatus, Service, ServiceCredential, ServiceRequest
from app.schemas import AdminRequestOut, AdminServiceOut, CredentialOut, NotificationCreate, ServiceCreate, ServiceUpdate, StatusUpdate
from app.security import decrypt_service_password
from app.uploads import save_upload

router = APIRouter(dependencies=[Depends(require_admin)])
STATUS_LABELS = {"PENDING": "قيد المراجعة", "ACTIVE": "تم التفعيل", "SUSPENDED": "موقوف مؤقتًا", "REJECTED": "مرفوض", "DISABLED": "معطّل"}


@router.get("/requests", response_model=list[AdminRequestOut])
async def list_requests(db: AsyncSession = Depends(get_db)) -> list[AdminRequestOut]:
    rows = (await db.execute(select(ServiceRequest, Customer, Service.name).join(Customer, Customer.id == ServiceRequest.customer_id).outerjoin(Service, Service.id == ServiceRequest.service_id).order_by(ServiceRequest.created_at.desc()))).all()
    return [AdminRequestOut(id=item.id, customer_id=customer.id, full_name=customer.full_name, username=customer.username, phone=customer.phone, service_name=name, custom_service_text=item.custom_service_text, status=item.status.value, created_at=item.created_at) for item, customer, name in rows]


@router.get("/requests/{request_id}/credential", response_model=CredentialOut)
async def reveal_credential(request_id: UUID, db: AsyncSession = Depends(get_db)) -> CredentialOut:
    credential = await db.scalar(select(ServiceCredential).where(ServiceCredential.request_id == request_id))
    if not credential:
        raise HTTPException(404, "بيانات الدخول غير موجودة")
    db.add(AdminAction(action="credential_revealed", target_id=str(request_id), details="Admin credential reveal"))
    await db.commit()
    return CredentialOut(username=credential.service_username, password=decrypt_service_password(credential.encrypted_password))


@router.patch("/requests/{request_id}/status")
async def update_status(request_id: UUID, payload: StatusUpdate, db: AsyncSession = Depends(get_db)) -> dict[str, str | bool]:
    try:
        new_status = RequestStatus(payload.status)
    except ValueError as exc:
        raise HTTPException(400, "حالة غير صالحة") from exc
    service_request = await db.get(ServiceRequest, request_id)
    if not service_request:
        raise HTTPException(404, "الطلب غير موجود")
    customer = await db.get(Customer, service_request.customer_id)
    service_request.status = new_status
    customer.status = new_status
    label = STATUS_LABELS[new_status.value]
    db.add(AdminAction(action="request_status_changed", target_id=str(service_request.id), details=new_status.value))
    db.add(Notification(customer_id=customer.id, title="تحديث حالة طلبك", body=f"تم تحديث حالة طلبك إلى: {label}."))
    await db.commit()
    return {"ok": True, "status": new_status.value}


@router.post("/media", status_code=status.HTTP_201_CREATED)
async def upload_media(file: UploadFile = File(...)) -> dict[str, str]:
    filename, kind, original_name = await save_upload(file)
    return {"file_url": filename, "kind": kind, "file_name": original_name}


@router.post("/customers/{customer_id}/notifications", status_code=status.HTTP_201_CREATED)
async def notify(customer_id: UUID, payload: NotificationCreate, db: AsyncSession = Depends(get_db)) -> dict:
    if not await db.get(Customer, customer_id):
        raise HTTPException(404, "العميل غير موجود")
    item = Notification(customer_id=customer_id, title=payload.title.strip(), body=payload.body.strip())
    db.add(item)
    await db.flush()
    if payload.file_url:
        db.add(NotificationAttachment(notification_id=item.id, kind=payload.kind or "file", file_url=payload.file_url, file_name=payload.file_name))
    db.add(AdminAction(action="notification_sent", target_id=str(customer_id), details=item.title))
    await db.commit()
    return {"ok": True, "notification_id": item.id}


@router.get("/services", response_model=list[AdminServiceOut])
async def admin_services(db: AsyncSession = Depends(get_db)) -> list[Service]:
    return list((await db.scalars(select(Service).order_by(Service.sort_order, Service.name))).all())


@router.post("/services", response_model=AdminServiceOut, status_code=status.HTTP_201_CREATED)
async def create_service(payload: ServiceCreate, db: AsyncSession = Depends(get_db)) -> Service:
    name = payload.name.strip()
    if await db.scalar(select(Service).where(Service.name == name)):
        raise HTTPException(409, "الخدمة موجودة بالفعل")
    item = Service(name=name, sort_order=payload.sort_order, is_active=True)
    db.add(item)
    await db.flush()
    db.add(AdminAction(action="service_created", target_id=str(item.id), details=name))
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/services/{service_id}", response_model=AdminServiceOut)
async def update_service(service_id: UUID, payload: ServiceUpdate, db: AsyncSession = Depends(get_db)) -> Service:
    item = await db.get(Service, service_id)
    if not item:
        raise HTTPException(404, "الخدمة غير موجودة")
    if payload.name is not None:
        item.name = payload.name.strip()
    if payload.is_active is not None:
        item.is_active = payload.is_active
    if payload.sort_order is not None:
        item.sort_order = payload.sort_order
    db.add(AdminAction(action="service_updated", target_id=str(service_id), details=item.name))
    await db.commit()
    await db.refresh(item)
    return item
