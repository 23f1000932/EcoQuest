from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import User, Badge, UserBadge
from schemas import UserProfileSchema, UserUpdateSchema, PublicUserSchema, BadgeSchema
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])


async def _load_user_badges(user_id: str, db: AsyncSession):
    result = await db.execute(
        select(UserBadge, Badge).join(Badge).where(UserBadge.user_id == user_id)
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


@router.get("/me", response_model=UserProfileSchema)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    badges = await _load_user_badges(current_user.id, db)
    return UserProfileSchema(
        id=current_user.id, supabase_uid=current_user.supabase_uid,
        name=current_user.name, email=current_user.email,
        avatar_url=current_user.avatar_url, points=current_user.points,
        level=current_user.level, carbon_saved=current_user.carbon_saved,
        streak_days=current_user.streak_days, is_admin=current_user.is_admin,
        created_at=current_user.created_at, badges=badges,
    )


@router.put("/me", response_model=UserProfileSchema)
async def update_me(
    body: UserUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.name is not None:
        current_user.name = body.name
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url
    current_user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(current_user)
    badges = await _load_user_badges(current_user.id, db)
    return UserProfileSchema(
        id=current_user.id, supabase_uid=current_user.supabase_uid,
        name=current_user.name, email=current_user.email,
        avatar_url=current_user.avatar_url, points=current_user.points,
        level=current_user.level, carbon_saved=current_user.carbon_saved,
        streak_days=current_user.streak_days, is_admin=current_user.is_admin,
        created_at=current_user.created_at, badges=badges,
    )


@router.get("/{user_id}", response_model=PublicUserSchema)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return PublicUserSchema.model_validate(user)
