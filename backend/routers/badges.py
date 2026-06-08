from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Badge, UserBadge
from schemas import BadgeSchema
from auth import get_current_user
from models import User

router = APIRouter(prefix="/badges", tags=["badges"])


@router.get("", response_model=list[BadgeSchema])
async def get_all_badges(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Badge).order_by(Badge.points_req))
    badges = result.scalars().all()
    return [BadgeSchema.model_validate(b) for b in badges]


@router.get("/mine", response_model=list[BadgeSchema])
async def get_my_badges(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserBadge, Badge).join(Badge).where(UserBadge.user_id == current_user.id)
    )
    return [
        BadgeSchema(
            id=badge.id, slug=badge.slug, name=badge.name,
            description=badge.description, icon=badge.icon,
            points_req=badge.points_req, color=badge.color,
            earned_at=ub.earned_at,
        )
        for ub, badge in result.all()
    ]
