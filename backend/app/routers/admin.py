from uuid import UUID
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import require_admin
from app.models import AdminAction,Customer,Notification,NotificationAttachment,RequestStatus,Service,ServiceRequest
from app.schemas import AdminRequestOut,NotificationCreate,StatusUpdate
router=APIRouter(dependencies=[Depends(require_admin)])
@router.get("/requests",response_model=list[AdminRequestOut])
async def list_requests(db:AsyncSession=Depends(get_db)):
    rows=(await db.execute(select(ServiceRequest,Customer,Service.name).join(Customer,Customer.id==ServiceRequest.customer_id).outerjoin(Service,Service.id==ServiceRequest.service_id).order_by(ServiceRequest.created_at.desc()))).all()
    return [AdminRequestOut(id=r.id,customer_id=c.id,full_name=c.full_name,username=c.username,phone=c.phone,service_name=name,custom_service_text=r.custom_service_text,status=r.status.value,created_at=r.created_at) for r,c,name in rows]
@router.patch("/requests/{request_id}/status")
async def update_status(request_id:UUID,payload:StatusUpdate,db:AsyncSession=Depends(get_db)):
    try: new=RequestStatus(payload.status)
    except ValueError: raise HTTPException(400,"حالة غير صالحة")
    req=await db.get(ServiceRequest,request_id)
    if not req: raise HTTPException(404,"الطلب غير موجود")
    req.status=new; customer=await db.get(Customer,req.customer_id); customer.status=new
    db.add(AdminAction(action="request_status_changed",target_id=str(req.id),details=new.value)); db.add(Notification(customer_id=customer.id,title="تحديث حالة طلبك",body=f"تم تحديث حالة طلبك إلى {new.value}.")); await db.commit(); return {"ok":True,"status":new.value}
@router.post("/customers/{customer_id}/notifications")
async def notify(customer_id:UUID,payload:NotificationCreate,db:AsyncSession=Depends(get_db)):
    if not await db.get(Customer,customer_id): raise HTTPException(404,"العميل غير موجود")
    item=Notification(customer_id=customer_id,title=payload.title,body=payload.body); db.add(item); await db.flush()
    if payload.file_url: db.add(NotificationAttachment(notification_id=item.id,kind=payload.kind or "file",file_url=payload.file_url,file_name=payload.file_name))
    db.add(AdminAction(action="notification_sent",target_id=str(customer_id),details=payload.title)); await db.commit(); return {"ok":True,"notification_id":item.id}
