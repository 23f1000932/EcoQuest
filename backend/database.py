from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import settings

# Build engine kwargs — pool settings only apply to PostgreSQL (asyncpg).
# SQLite (aiosqlite) ignores them gracefully.
_is_postgres = settings.DATABASE_URL.startswith("postgresql") or settings.DATABASE_URL.startswith("postgres")

_engine_kwargs: dict = {"echo": settings.ENVIRONMENT == "development", "future": True}
if _is_postgres:
    _engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 1800,  # Recycle connections every 30 min (avoids idle timeouts)
    })

# Supabase connection strings start with "postgres://" — SQLAlchemy needs "postgresql+asyncpg://"
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _db_url.startswith("postgresql://") and "+asyncpg" not in _db_url:
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(_db_url, **_engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Create all tables (for SQLite dev only)."""
    async with engine.begin() as conn:
        from models import Base as ModelBase  # noqa: F401
        await conn.run_sync(ModelBase.metadata.create_all)
