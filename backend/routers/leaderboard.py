from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import get_db
from models import User, Badge, UserBadge
from schemas import LeaderboardEntrySchema, BadgeSchema
from collections import defaultdict

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=list[LeaderboardEntrySchema])
async def get_leaderboard(limit: int = Query(default=100, le=100), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).order_by(desc(User.points)).limit(limit)
    )
    users = result.scalars().all()

    if not users:
        return []

    # Single batched query for all badges (fixes N+1)
    user_ids = [u.id for u in users]
    ub_result = await db.execute(
        select(UserBadge, Badge)
        .join(Badge)
        .where(UserBadge.user_id.in_(user_ids))
    )
    badges_by_user: dict[str, list] = defaultdict(list)
    for ub, badge in ub_result.all():
        badges_by_user[ub.user_id].append(
            BadgeSchema(
                id=badge.id, slug=badge.slug, name=badge.name,
                description=badge.description, icon=badge.icon,
                points_req=badge.points_req, color=badge.color,
                earned_at=ub.earned_at,
            )
        )

    leaderboard = []
    for rank, user in enumerate(users, start=1):
        badges = badges_by_user.get(user.id, [])[:3]
        leaderboard.append(LeaderboardEntrySchema(
            rank=rank,
            id=user.id,
            name=user.name,
            avatar_url=user.avatar_url,
            points=user.points,
            carbon_saved=user.carbon_saved,
            level=user.level,
            badges=badges,
        ))

    return leaderboard
