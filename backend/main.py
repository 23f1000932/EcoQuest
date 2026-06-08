from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routers import auth, users, activities, leaderboard, badges, rewards, impact, admin
from config import settings

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="EcoQuest India API",
    version="1.0.0",
    description="Backend API for EcoQuest India — sustainability gamification platform",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
for router_module in [auth, users, activities, leaderboard, badges, rewards, impact, admin]:
    app.include_router(router_module.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


@app.on_event("startup")
async def startup_event():
    """Initialize database and seed data on first run."""
    from database import init_db, AsyncSessionLocal
    from models import Badge, Reward, PlatformStats
    from sqlalchemy import select
    import uuid

    await init_db()

    async with AsyncSessionLocal() as db:
        # Seed badges if empty
        badge_count = await db.execute(select(Badge))
        if not badge_count.scalars().first():
            badges_data = [
                {"slug": "green-beginner", "name": "Green Beginner", "description": "Complete your first eco action", "icon": "🌱", "points_req": 0, "color": "#86efac"},
                {"slug": "eco-explorer", "name": "Eco Explorer", "description": "Earn 200 points", "icon": "🌿", "points_req": 200, "color": "#4ade80"},
                {"slug": "tree-champion", "name": "Tree Champion", "description": "Plant 5 trees (500 points)", "icon": "🌳", "points_req": 500, "color": "#22c55e"},
                {"slug": "cycling-hero", "name": "Cycling Hero", "description": "Log 10 cycling trips", "icon": "🚴", "points_req": 250, "color": "#16a34a"},
                {"slug": "public-transport-pro", "name": "Public Transport Pro", "description": "Use public transport 20 times", "icon": "🚌", "points_req": 600, "color": "#15803d"},
                {"slug": "sustainability-legend", "name": "Sustainability Legend", "description": "Reach 1000 points", "icon": "🏆", "points_req": 1000, "color": "#14532d"},
            ]
            for b in badges_data:
                db.add(Badge(id=str(uuid.uuid4()), **b))

        # Seed rewards if empty
        reward_count = await db.execute(select(Reward))
        if not reward_count.scalars().first():
            rewards_data = [
                {"title": "Amazon Gift Card ₹200", "description": "Digital gift card emailed within 48h", "points_req": 500, "stock": 50, "icon": "🛍️"},
                {"title": "Eco Tote Bag", "description": "Cotton reusable bag shipped to your address", "points_req": 300, "stock": 100, "icon": "👜"},
                {"title": "Sustainability Certificate", "description": "PDF certificate of achievement", "points_req": 100, "stock": -1, "icon": "📜"},
                {"title": "Plant a Tree (on behalf)", "description": "We plant a tree in your name via partner NGO", "points_req": 200, "stock": 200, "icon": "🌳"},
                {"title": "Monthly Champion Badge", "description": "Featured on homepage for the month", "points_req": 800, "stock": 10, "icon": "👑"},
            ]
            for r in rewards_data:
                db.add(Reward(id=str(uuid.uuid4()), **r))

        # Seed platform stats if empty
        stats_result = await db.execute(select(PlatformStats).where(PlatformStats.id == 1))
        if not stats_result.scalar_one_or_none():
            db.add(PlatformStats(
                id=1,
                total_users=1247,
                total_activities=8934,
                total_carbon_saved=42180.5,
                trees_planted=3211,
                cycling_trips=2104,
                public_transport_trips=1890,
            ))

        await db.commit()
