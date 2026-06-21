"""Test fixtures — spin up the app with a temp in-memory SQLite DB."""
import os, pytest, pytest_asyncio
from httpx import AsyncClient, ASGITransport
from asgi_lifespan import LifespanManager

# Point the app at a fresh in-memory database BEFORE importing anything
# that reads config.settings (i.e. database.py, main.py).
os.environ["DATABASE_URL"] = "sqlite+aiosqlite://"   # in-memory
os.environ["ENVIRONMENT"] = "development"

from main import app  # noqa: E402  — must come after env override


@pytest_asyncio.fixture(scope="session")
async def client():
    """Yield an httpx AsyncClient whose underlying app has run its startup event."""
    async with LifespanManager(app) as _manager:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            yield ac
