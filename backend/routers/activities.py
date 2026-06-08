from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models import User, Activity, Badge, UserBadge, PlatformStats, ActivityStatus
from schemas import ActivitySchema, ActivityListResponse, UploadResponse, BadgeSchema
from auth import get_current_user
from ai_verifier import verify_image
from anti_cheat import compute_phash, is_duplicate
from config import settings
from slowapi import Limiter
from slowapi.util import get_remote_address
import uuid
from datetime import datetime, date
import math

router = APIRouter(prefix="/activities", tags=["activities"])
limiter = Limiter(key_func=get_remote_address)

LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000]


def compute_level(points: int) -> int:
    level = 1
    for i, t in enumerate(LEVEL_THRESHOLDS):
        if points >= t:
            level = i + 1
    return level


async def check_and_award_badges(user: User, db: AsyncSession) -> list:
    """Check and award any newly unlocked badges. Returns list of newly earned badges."""
    all_badges_result = await db.execute(select(Badge))
    all_badges = all_badges_result.scalars().all()

    ub_result = await db.execute(
        select(UserBadge.badge_id).where(UserBadge.user_id == user.id)
    )
    user_badge_ids = {row[0] for row in ub_result.all()}

    newly_earned = []
    for badge in all_badges:
        if badge.id in user_badge_ids:
            continue
        if user.points >= badge.points_req:
            db.add(UserBadge(id=str(uuid.uuid4()), user_id=user.id, badge_id=badge.id))
            newly_earned.append(BadgeSchema(
                id=badge.id, slug=badge.slug, name=badge.name,
                description=badge.description, icon=badge.icon,
                points_req=badge.points_req, color=badge.color,
                earned_at=datetime.utcnow(),
            ))

    await db.commit()
    return newly_earned


async def update_platform_stats(activity: Activity, db: AsyncSession):
    result = await db.execute(select(PlatformStats).where(PlatformStats.id == 1))
    stats = result.scalar_one_or_none()
    if not stats:
        return
    stats.total_activities += 1
    stats.total_points += activity.points_awarded
    stats.total_carbon_saved += activity.carbon_saved
    if activity.activity_type == "Tree Plantation":
        stats.trees_planted += 1
    if activity.activity_type == "Cycling":
        stats.cycling_trips += 1
    if activity.activity_type == "Public Transport":
        stats.public_transport_trips += 1
    stats.updated_at = datetime.utcnow()
    await db.commit()


@router.post("/upload", response_model=UploadResponse)
@limiter.limit("5/minute")
async def upload_activity(
    request: Request,
    image: UploadFile = File(...),
    description: str = Form(default=""),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate file type
    if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are accepted")

    image_bytes = await image.read()
    if len(image_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB")

    # Check daily upload limit
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    count_result = await db.execute(
        select(func.count(Activity.id)).where(
            Activity.user_id == current_user.id,
            Activity.created_at >= today_start,
        )
    )
    daily_count = count_result.scalar() or 0
    if daily_count >= settings.MAX_DAILY_UPLOADS:
        raise HTTPException(status_code=429, detail=f"Daily upload limit of {settings.MAX_DAILY_UPLOADS} reached")

    # Compute pHash and check for duplicates
    image_hash = compute_phash(image_bytes)
    hashes_result = await db.execute(
        select(Activity.image_hash).where(
            Activity.user_id == current_user.id,
            Activity.image_hash.isnot(None),
        )
    )
    existing_hashes = [row[0] for row in hashes_result.all()]
    if is_duplicate(image_hash, existing_hashes):
        raise HTTPException(status_code=409, detail="This image was already submitted")

    # Upload to Supabase Storage or use a placeholder URL for dev
    image_url = f"https://placeholder.ecoquest.in/images/{uuid.uuid4()}.jpg"
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        try:
            from supabase import create_client
            supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            file_path = f"{current_user.id}/{uuid.uuid4()}.jpg"
            supabase_client.storage.from_("activity-images").upload(
                path=file_path,
                file=image_bytes,
                file_options={"content-type": image.content_type},
            )
            image_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/activity-images/{file_path}"
        except Exception as e:
            # Fall back to placeholder if Supabase not configured
            pass

    # AI Verification
    ai_result = await verify_image(image_url)

    confidence = float(ai_result.get("confidence", 0))
    activity_type = ai_result.get("activity", "Other Eco Action")
    points = int(ai_result.get("points", 15))
    carbon = float(ai_result.get("carbon_saved", 0.0))

    # Determine status based on confidence
    if confidence < 40:
        status = ActivityStatus.rejected
        points = 0
        carbon = 0.0
        rejection_note = "Low confidence: " + ai_result.get("reason", "Image does not appear to show an eco-friendly activity")
    elif confidence < settings.AI_CONFIDENCE_THRESHOLD:
        status = ActivityStatus.pending
        points = 0
        carbon = 0.0
        rejection_note = None
    else:
        status = ActivityStatus.approved
        rejection_note = None

    # Create activity record
    activity = Activity(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        image_url=image_url,
        image_hash=image_hash,
        description=description or None,
        activity_type=activity_type,
        points_awarded=points,
        carbon_saved=carbon,
        confidence=confidence,
        ai_response=ai_result,
        status=status,
        rejection_note=rejection_note,
    )
    db.add(activity)

    # Award points and update streak
    newly_earned_badges = []
    if status == ActivityStatus.approved:
        current_user.points += points
        current_user.carbon_saved += carbon
        current_user.level = compute_level(current_user.points)

        # Update streak
        today_str = date.today().isoformat()
        if current_user.last_upload_date == today_str:
            pass  # Same day, no streak change
        elif current_user.last_upload_date:
            from datetime import timedelta
            last_date = date.fromisoformat(current_user.last_upload_date)
            if (date.today() - last_date).days == 1:
                current_user.streak_days += 1
                points += 5  # Streak bonus
            else:
                current_user.streak_days = 1
        else:
            current_user.streak_days = 1
        current_user.last_upload_date = today_str

        await db.commit()
        newly_earned_badges = await check_and_award_badges(current_user, db)
        await update_platform_stats(activity, db)

    await db.commit()
    await db.refresh(activity)

    message = {
        ActivityStatus.approved: f"🎉 {activity_type} verified! +{points} points awarded!",
        ActivityStatus.pending: "⏳ Your action is under review by our team.",
        ActivityStatus.rejected: "❌ Image could not be verified as an eco-friendly action.",
    }[status]

    return UploadResponse(
        activity=ActivitySchema.model_validate(activity),
        message=message,
        badges_earned=newly_earned_badges,
    )


@router.get("/history", response_model=ActivityListResponse)
async def get_history(
    page: int = 1,
    limit: int = 10,
    status: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Activity).where(Activity.user_id == current_user.id)
    if status:
        try:
            query = query.where(Activity.status == ActivityStatus(status))
        except ValueError:
            pass
    query = query.order_by(Activity.created_at.desc())

    count_result = await db.execute(
        select(func.count()).select_from(Activity).where(Activity.user_id == current_user.id)
    )
    total = count_result.scalar() or 0

    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    activities = result.scalars().all()

    return ActivityListResponse(
        activities=[ActivitySchema.model_validate(a) for a in activities],
        total=total,
        pages=math.ceil(total / limit) if total else 1,
    )


@router.get("/{activity_id}", response_model=ActivitySchema)
async def get_activity(
    activity_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Activity).where(Activity.id == activity_id, Activity.user_id == current_user.id)
    )
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return ActivitySchema.model_validate(activity)
