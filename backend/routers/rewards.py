from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import User, Reward, Redemption, RedemptionStatus
from schemas import RewardSchema, RedemptionSchema
from auth import get_current_user
import uuid

router = APIRouter(prefix="/rewards", tags=["rewards"])


@router.get("", response_model=list[RewardSchema])
async def get_rewards(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Reward).where(Reward.is_active == True).order_by(Reward.points_req))
    return [RewardSchema.model_validate(r) for r in result.scalars().all()]


@router.post("/{reward_id}/redeem")
async def redeem_reward(
    reward_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Reward).where(Reward.id == reward_id, Reward.is_active == True))
    reward = result.scalar_one_or_none()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    if current_user.points < reward.points_req:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough points. Need {reward.points_req}, have {current_user.points}"
        )

    if reward.stock == 0:
        raise HTTPException(status_code=400, detail="This reward is out of stock")

    # Deduct points
    current_user.points -= reward.points_req
    if reward.stock > 0:
        reward.stock -= 1

    redemption = Redemption(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        reward_id=reward.id,
        status=RedemptionStatus.pending,
    )
    db.add(redemption)
    await db.commit()

    return {"redemption_id": redemption.id, "message": f"🎁 {reward.title} redeemed successfully! We'll process it within 48 hours."}


@router.get("/my-redemptions", response_model=list[RedemptionSchema])
async def my_redemptions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Redemption).where(Redemption.user_id == current_user.id).order_by(Redemption.created_at.desc())
    )
    redemptions = result.scalars().all()
    out = []
    for r in redemptions:
        reward_res = await db.execute(select(Reward).where(Reward.id == r.reward_id))
        reward = reward_res.scalar_one_or_none()
        out.append(RedemptionSchema(
            id=r.id, reward_id=r.reward_id, status=r.status,
            created_at=r.created_at,
            reward=RewardSchema.model_validate(reward) if reward else None,
        ))
    return out
