from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import User, Badge, UserBadge
from schemas import AuthVerifyRequest, AuthVerifyResponse, UserProfileSchema, BadgeSchema
from auth import decode_supabase_token, create_access_token
from config import settings
from datetime import datetime
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


def compute_level(points: int) -> int:
    thresholds = [0, 100, 300, 600, 1000, 2000]
    for i, t in enumerate(reversed(thresholds)):
        if points >= t:
            return len(thresholds) - i
    return 1


@router.post("/verify", response_model=AuthVerifyResponse)
async def verify_token(body: AuthVerifyRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_supabase_token(body.supabase_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Supabase token")

    supabase_uid = payload.get("sub")
    email = payload.get("email", "")
    name = payload.get("user_metadata", {}).get("full_name", email.split("@")[0] if email else "User")
    avatar_url = payload.get("user_metadata", {}).get("avatar_url")

    if not supabase_uid:
        raise HTTPException(status_code=401, detail="Invalid token: missing sub")

    # Upsert user
    result = await db.execute(select(User).where(User.supabase_uid == supabase_uid))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id=str(uuid.uuid4()),
            supabase_uid=supabase_uid,
            name=name,
            email=email,
            avatar_url=avatar_url,
            is_admin=(email == settings.ADMIN_EMAIL),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Award Green Beginner badge
        badge_result = await db.execute(select(Badge).where(Badge.slug == "green-beginner"))
        badge = badge_result.scalar_one_or_none()
        if badge:
            db.add(UserBadge(user_id=user.id, badge_id=badge.id))
            await db.commit()
    else:
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        user.updated_at = datetime.utcnow()
        await db.commit()

    # Load user badges
    ub_result = await db.execute(
        select(UserBadge, Badge).join(Badge).where(UserBadge.user_id == user.id)
    )
    badges = [
        BadgeSchema(
            id=badge.id, slug=badge.slug, name=badge.name,
            description=badge.description, icon=badge.icon,
            points_req=badge.points_req, color=badge.color,
            earned_at=ub.earned_at
        )
        for ub, badge in ub_result.all()
    ]

    access_token = create_access_token({"sub": user.id, "email": user.email})
    user_profile = UserProfileSchema(
        id=user.id, supabase_uid=user.supabase_uid, name=user.name,
        email=user.email, avatar_url=user.avatar_url, points=user.points,
        level=user.level, carbon_saved=user.carbon_saved, streak_days=user.streak_days,
        is_admin=user.is_admin, created_at=user.created_at, badges=badges,
    )

    return AuthVerifyResponse(user=user_profile, access_token=access_token)


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
