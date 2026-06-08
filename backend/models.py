import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime,
    ForeignKey, UniqueConstraint, Enum as SAEnum, BigInteger, JSON
)
from sqlalchemy.orm import relationship
from database import Base
import enum


def gen_uuid():
    return str(uuid.uuid4())


class ActivityStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class RedemptionStatus(str, enum.Enum):
    pending = "pending"
    fulfilled = "fulfilled"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    supabase_uid = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    avatar_url = Column(String, nullable=True)
    points = Column(Integer, nullable=False, default=0)
    level = Column(Integer, nullable=False, default=1)
    carbon_saved = Column(Float, nullable=False, default=0.0)
    is_admin = Column(Boolean, nullable=False, default=False)
    streak_days = Column(Integer, nullable=False, default=0)
    last_upload_date = Column(String, nullable=True)  # ISO date string
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")
    user_badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    redemptions = relationship("Redemption", back_populates="user", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(Text, nullable=False)
    image_hash = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    activity_type = Column(String, nullable=False)
    points_awarded = Column(Integer, nullable=False, default=0)
    carbon_saved = Column(Float, nullable=False, default=0.0)
    confidence = Column(Float, nullable=False, default=0.0)
    ai_response = Column(JSON, nullable=True)
    status = Column(SAEnum(ActivityStatus), nullable=False, default=ActivityStatus.pending)
    rejection_note = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User", back_populates="activities")


class Badge(Base):
    __tablename__ = "badges"

    id = Column(String, primary_key=True, default=gen_uuid)
    slug = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    points_req = Column(Integer, nullable=False, default=0)
    color = Column(String, nullable=False, default="#22c55e")

    user_badges = relationship("UserBadge", back_populates="badge")


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_id = Column(String, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    earned_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "badge_id"),)

    user = relationship("User", back_populates="user_badges")
    badge = relationship("Badge", back_populates="user_badges")


class Reward(Base):
    __tablename__ = "rewards"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    points_req = Column(Integer, nullable=False)
    stock = Column(Integer, nullable=False, default=100)
    icon = Column(String, nullable=False, default="🎁")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    redemptions = relationship("Redemption", back_populates="reward")


class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reward_id = Column(String, ForeignKey("rewards.id"), nullable=False)
    status = Column(SAEnum(RedemptionStatus), nullable=False, default=RedemptionStatus.pending)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User", back_populates="redemptions")
    reward = relationship("Reward", back_populates="redemptions")


class PlatformStats(Base):
    __tablename__ = "platform_stats"

    id = Column(Integer, primary_key=True, default=1)
    total_users = Column(Integer, nullable=False, default=0)
    total_activities = Column(Integer, nullable=False, default=0)
    total_points = Column(BigInteger, nullable=False, default=0)
    total_carbon_saved = Column(Float, nullable=False, default=0.0)
    trees_planted = Column(Integer, nullable=False, default=0)
    cycling_trips = Column(Integer, nullable=False, default=0)
    public_transport_trips = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
