from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import current_customer
from app.models import Customer, Notification, NotificationAttachment, Service, ServiceRequest
from app.schemas import AttachmentOut, MeOut, NotificationOut, RequestOut

router = APIRouter()


@router.get("/me", response_model=MeOut)
async def me(customer: Customer = Depends(current_customer)) -> MeOut:
    return MeOut(id=customer.id, full_name=customer.full_name, username=customer.username, phone=customer.phone, status=customer.status.value)


@router.get("/requests", response_model=list[RequestOut])
async def requests(customer: Customer = Depends(current_customer), db: AsyncSession = Depends(get_db)) -> list[RequestOut]:
    rows = (await db.execute(
        select(ServiceRequest, Service.name)
        .outerjoin(Service, Service.id == ServiceRequest.service_id)
        .where(ServiceRequest.customer_id == customer.id)
        .order_by(ServiceRequest.created_at.desc())
    )).all()
    return [RequestOut(id=request.id, service_name=name, custom_service_text=request.custom_service_text, status=request.status.value, created_at=request.created_at) for request, name in rows]


@router.get("/notifications", response_model=list[NotificationOut])
async def notifications(customer: Customer = Depends(current_customer), db: AsyncSession = Depends(get_db)) -> list[NotificationOut]:
    notes = list((await db.scalars(
        select(Notification).where(Notification.customer_id == customer.id).order_by(Notification.created_at.desc())
    )).all())
    if not notes:
        return []

    note_ids = [note.id for note in notes]
    attachments = list((await db.scalars(
        select(NotificationAttachment).where(NotificationAttachment.notification_id.in_(note_ids))
    )).all())
    grouped: dict[UUID, list[AttachmentOut]] = {}
    for item in attachments:
        grouped.setdefault(item.notification_id, []).append(AttachmentOut(id=item.id, kind=item.kind, file_url=item.file_url, file_name=item.file_name))

    return [NotificationOut(
        id=note.id, title=note.title, body=note.body, is_read=note.is_read, created_at=note.created_at,
        attachments=grouped.get(note.id, []),
    ) for note in notes]


@router.post("/notifications/{notification_id}/read")
async def mark_read(notification_id: UUID, customer: Customer = Depends(current_customer), db: AsyncSession = Depends(get_db)) -> dict[str, bool]:
    item = await db.scalar(select(Notification).where(Notification.id == notification_id, Notification.customer_id == customer.id))
    if not item:
        raise HTTPException(404, "الإشعار غير موجود")
    item.is_read = True
    await db.commit()
    return {"ok": True}
