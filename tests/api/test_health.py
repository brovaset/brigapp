"""
API regression tests: health check.
"""
import pytest
import requests


@pytest.mark.api
def test_health_returns_200_and_healthy(api_base):
    """GET /api/health returns 200 and status healthy when DB is connected."""
    r = requests.get(f"{api_base}/health", timeout=10)
    assert r.status_code in (200, 503), f"Unexpected status: {r.status_code}"
    data = r.json()
    assert "status" in data
    assert data["status"] in ("healthy", "unhealthy")
    assert "timestamp" in data
    if r.status_code == 200:
        assert data.get("database") == "connected"
