from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import PlatformStats
from schemas import ImpactSchema

router = APIRouter(prefix="/impact", tags=["impact"])


@router.get("", response_model=ImpactSchema)
async def get_impact(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PlatformStats).where(PlatformStats.id == 1))
    stats = result.scalar_one_or_none()
    if not stats:
        return ImpactSchema(
            total_users=0, total_activities=0,
            total_carbon_saved=0.0, trees_planted=0,
            cycling_trips=0, public_transport_trips=0,
        )
    return ImpactSchema(
        total_users=stats.total_users,
        total_activities=stats.total_activities,
        total_carbon_saved=stats.total_carbon_saved,
        trees_planted=stats.trees_planted,
        cycling_trips=stats.cycling_trips,
        public_transport_trips=stats.public_transport_trips,
    )
