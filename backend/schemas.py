from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


# ─────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────
class ActivityStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class RedemptionStatus(str, Enum):
    pending = "pending"
    fulfilled = "fulfilled"
    cancelled = "cancelled"


# ─────────────────────────────────────────────
# Badge
# ─────────────────────────────────────────────
class BadgeSchema(BaseModel):
    id: str
    slug: str
    name: str
    description: str
    icon: str
    points_req: int
    color: str
    earned_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# User
# ─────────────────────────────────────────────
class UserSchema(BaseModel):
    id: str
    supabase_uid: str
    name: str
    email: str
    avatar_url: Optional[str] = None
    points: int
    level: int
    carbon_saved: float
    streak_days: int
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileSchema(UserSchema):
    badges: List[BadgeSchema] = []


class UserUpdateSchema(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class PublicUserSchema(BaseModel):
    id: str
    name: str
    avatar_url: Optional[str] = None
    points: int
    level: int
    carbon_saved: float
    streak_days: int

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# Activity
# ─────────────────────────────────────────────
class ActivitySchema(BaseModel):
    id: str
    user_id: str
    image_url: str
    description: Optional[str] = None
    activity_type: str
    points_awarded: int
    carbon_saved: float
    confidence: float
    ai_response: Optional[Any] = None
    status: ActivityStatus
    rejection_note: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ActivityListResponse(BaseModel):
    activities: List[ActivitySchema]
    total: int
    pages: int


class UploadResponse(BaseModel):
    activity: ActivitySchema
    message: str
    badges_earned: List[BadgeSchema] = []


# ─────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────
class AuthVerifyRequest(BaseModel):
    supabase_token: str


class AuthVerifyResponse(BaseModel):
    user: UserProfileSchema
    access_token: str


# ─────────────────────────────────────────────
# Leaderboard
# ─────────────────────────────────────────────
class LeaderboardEntrySchema(BaseModel):
    rank: int
    id: str
    name: str
    avatar_url: Optional[str] = None
    points: int
    carbon_saved: float
    level: int
    badges: List[BadgeSchema] = []

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# Rewards
# ─────────────────────────────────────────────
class RewardSchema(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    points_req: int
    stock: int
    icon: str
    is_active: bool

    model_config = {"from_attributes": True}


class RedemptionSchema(BaseModel):
    id: str
    reward_id: str
    status: RedemptionStatus
    created_at: datetime
    reward: Optional[RewardSchema] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# Impact
# ─────────────────────────────────────────────
class ImpactSchema(BaseModel):
    total_users: int
    total_activities: int
    total_carbon_saved: float
    trees_planted: int
    cycling_trips: int
    public_transport_trips: int


# ─────────────────────────────────────────────
# Admin
# ─────────────────────────────────────────────
class AdminActivitySchema(ActivitySchema):
    user_name: Optional[str] = None
    user_email: Optional[str] = None


class AdminRejectRequest(BaseModel):
    note: str
