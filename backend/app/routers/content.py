from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import SiteSetting
from app.site_content import DEFAULT_SITE_CONTENT

router = APIRouter()


@router.get("", response_model=dict[str, str])
async def get_site_content(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    values = DEFAULT_SITE_CONTENT.copy()
    rows = (await db.scalars(select(SiteSetting))).all()
    values.update({row.key: row.value for row in rows if row.key in values})
    return values
