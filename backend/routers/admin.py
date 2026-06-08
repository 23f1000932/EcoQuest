from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models import User, Activity, ActivityStatus, PlatformStats
from schemas import ActivitySchema, AdminRejectRequest
from auth import get_admin_user
from datetime import datetime
import math

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/activities")
async def list_activities(
    status: str = Query(default="pending"),
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        status_enum = ActivityStatus(status)
    except ValueError:
        status_enum = ActivityStatus.pending

    query = select(Activity).where(Activity.status == status_enum).order_by(Activity.created_at.desc())
    count_result = await db.execute(select(func.count()).select_from(Activity).where(Activity.status == status_enum))
    total = count_result.scalar() or 0

    result = await db.execute(query.offset((page - 1) * limit).limit(limit))
    activities = result.scalars().all()

    out = []
    for a in activities:
        user_result = await db.execute(select(User).where(User.id == a.user_id))
        user = user_result.scalar_one_or_none()
        a_dict = ActivitySchema.model_validate(a).model_dump()
        a_dict["user_name"] = user.name if user else None
        a_dict["user_email"] = user.email if user else None
        out.append(a_dict)

    return {"activities": out, "total": total, "pages": math.ceil(total / limit) if total else 1}


@router.put("/activities/{activity_id}/approve")
async def approve_activity(
    activity_id: str,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Activity).where(Activity.id == activity_id))
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    if activity.status != ActivityStatus.pending:
        raise HTTPException(status_code=400, detail="Activity is not pending")

    activity.status = ActivityStatus.approved

    # Award points to user
    user_result = await db.execute(select(User).where(User.id == activity.user_id))
    user = user_result.scalar_one_or_none()
    if user:
        user.points += activity.points_awarded
        user.carbon_saved += activity.carbon_saved

    await db.commit()
    return {"message": "Activity approved"}


@router.put("/activities/{activity_id}/reject")
async def reject_activity(
    activity_id: str,
    body: AdminRejectRequest,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Activity).where(Activity.id == activity_id))
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    activity.status = ActivityStatus.rejected
    activity.rejection_note = body.note
    activity.points_awarded = 0
    await db.commit()
    return {"message": "Activity rejected"}


@router.get("/users")
async def list_users(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    count_result = await db.execute(select(func.count()).select_from(User))
    total = count_result.scalar() or 0

    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit)
    )
    users = result.scalars().all()
    return {
        "users": [{"id": u.id, "name": u.name, "email": u.email, "points": u.points,
                   "is_admin": u.is_admin, "created_at": u.created_at.isoformat()} for u in users],
        "total": total,
        "pages": math.ceil(total / limit) if total else 1,
    }


@router.put("/users/{user_id}/admin")
async def toggle_admin(
    user_id: str,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = not user.is_admin
    await db.commit()
    return {"is_admin": user.is_admin}


@router.get("/stats")
async def admin_stats(
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    stats_result = await db.execute(select(PlatformStats).where(PlatformStats.id == 1))
    stats = stats_result.scalar_one_or_none()

    pending_count = await db.execute(
        select(func.count()).select_from(Activity).where(Activity.status == ActivityStatus.pending)
    )

    return {
        "platform": {
            "total_users": stats.total_users if stats else 0,
            "total_activities": stats.total_activities if stats else 0,
            "total_carbon_saved": stats.total_carbon_saved if stats else 0,
            "trees_planted": stats.trees_planted if stats else 0,
        },
        "pending_activities": pending_count.scalar() or 0,
    }
