"""Comprehensive backend API tests for EcoQuest."""
import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    """Test the health endpoint returns 200 and correct payload."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "environment" in data


@pytest.mark.asyncio
async def test_health_check_has_environment(client):
    """Test health endpoint includes environment field."""
    response = await client.get("/health")
    data = response.json()
    assert data["environment"] in ("development", "production", "staging")


@pytest.mark.asyncio
async def test_get_leaderboard(client):
    """Test leaderboard endpoint returns list."""
    response = await client.get("/api/leaderboard")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_leaderboard_with_limit(client):
    """Test leaderboard respects limit query param."""
    response = await client.get("/api/leaderboard?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5


@pytest.mark.asyncio
async def test_get_badges(client):
    """Test badges endpoint returns list."""
    response = await client.get("/api/badges")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_badges_have_required_fields(client):
    """Test each badge has required fields."""
    response = await client.get("/api/badges")
    data = response.json()
    assert len(data) > 0, "Seed data should have created badges"
    badge = data[0]
    assert "id" in badge
    assert "name" in badge
    assert "slug" in badge
    assert "icon" in badge
    assert "points_req" in badge


@pytest.mark.asyncio
async def test_get_impact(client):
    """Test impact endpoint returns stats."""
    response = await client.get("/api/impact")
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "total_activities" in data
    assert "total_carbon_saved" in data
    assert "trees_planted" in data
    assert "cycling_trips" in data
    assert "public_transport_trips" in data


@pytest.mark.asyncio
async def test_impact_values_are_numbers(client):
    """Test impact values are numeric types."""
    response = await client.get("/api/impact")
    data = response.json()
    assert isinstance(data["total_users"], int)
    assert isinstance(data["total_activities"], int)
    assert isinstance(data["total_carbon_saved"], (int, float))
    assert isinstance(data["trees_planted"], int)


@pytest.mark.asyncio
async def test_get_rewards(client):
    """Test rewards endpoint returns list."""
    response = await client.get("/api/rewards")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_rewards_have_required_fields(client):
    """Test each reward has required fields."""
    response = await client.get("/api/rewards")
    data = response.json()
    assert len(data) > 0, "Seed data should have created rewards"
    reward = data[0]
    assert "id" in reward
    assert "title" in reward
    assert "points_req" in reward


@pytest.mark.asyncio
async def test_logout(client):
    """Test logout endpoint returns success message."""
    response = await client.post("/api/auth/logout")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "Logged out" in data["message"]


@pytest.mark.asyncio
async def test_verify_without_token(client):
    """Test verify endpoint rejects request without valid token."""
    response = await client.post("/api/auth/verify", json={"supabase_token": "invalid-token"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_endpoint_without_auth(client):
    """Test protected endpoints require authentication."""
    response = await client.get("/api/badges/mine")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_redeem_without_auth(client):
    """Test reward redemption requires authentication."""
    response = await client.post("/api/rewards/fake-id/redeem")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_nonexistent_route(client):
    """Test 404 for non-existent routes."""
    response = await client.get("/api/nonexistent")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_cors_headers(client):
    """Test CORS headers are present on responses."""
    response = await client.options(
        "/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers


@pytest.mark.asyncio
async def test_leaderboard_limit_validation(client):
    """Test leaderboard rejects limit > 100."""
    response = await client.get("/api/leaderboard?limit=200")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_activities_without_auth(client):
    """Test activities listing requires auth."""
    response = await client.get("/api/activities/history")
    assert response.status_code in (401, 403)
