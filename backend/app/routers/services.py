from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Service
from app.schemas import ServiceOut

router = APIRouter()


@router.get("", response_model=list[ServiceOut])
async def list_services(db: AsyncSession = Depends(get_db)) -> list[Service]:
    result = await db.scalars(select(Service).where(Service.is_active.is_(True)).order_by(Service.name))
    return list(result.all())
