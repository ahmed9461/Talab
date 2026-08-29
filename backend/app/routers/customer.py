from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import current_customer
from app.models import Customer,Notification,Service,ServiceRequest
from app.schemas import MeOut,NotificationOut,RequestOut
router=APIRouter()
@router.get("/me",response_model=MeOut)
async def me(customer:Customer=Depends(current_customer)): return MeOut(id=customer.id,full_name=customer.full_name,username=customer.username,phone=customer.phone,status=customer.status.value)
@router.get("/requests",response_model=list[RequestOut])
async def requests(customer:Customer=Depends(current_customer),db:AsyncSession=Depends(get_db)):
    rows=(await db.execute(select(ServiceRequest,Service.name).outerjoin(Service,Service.id==ServiceRequest.service_id).where(ServiceRequest.customer_id==customer.id).order_by(ServiceRequest.created_at.desc()))).all()
    return [RequestOut(id=r.id,service_name=name,custom_service_text=r.custom_service_text,status=r.status.value,created_at=r.created_at) for r,name in rows]
@router.get("/notifications",response_model=list[NotificationOut])
async def notifications(customer:Customer=Depends(current_customer),db:AsyncSession=Depends(get_db)):
    return list((await db.scalars(select(Notification).where(Notification.customer_id==customer.id).order_by(Notification.created_at.desc()))).all())
@router.post("/notifications/{notification_id}/read")
async def mark_read(notification_id:str,customer:Customer=Depends(current_customer),db:AsyncSession=Depends(get_db)):
    item=await db.scalar(select(Notification).where(Notification.id==notification_id,Notification.customer_id==customer.id))
    if not item: raise HTTPException(404,"الإشعار غير موجود")
    item.is_read=True; await db.commit(); return {"ok":True}
