"""
API regression tests: bookings (GET requires auth, POST requires auth + body).
"""
import pytest
import requests


@pytest.mark.api
def test_bookings_get_requires_auth(api_base):
    """GET /api/bookings returns 401 without auth."""
    r = requests.get(f"{api_base}/bookings", timeout=10)
    assert r.status_code == 401


@pytest.mark.api
def test_bookings_get_returns_empty_with_valid_auth(api_base):
    """GET /api/bookings returns 200 and bookings array when authenticated."""
    email = f"pytest-bookings-{id(object())}@example.com"
    reg = requests.post(
        f"{api_base}/auth/register",
        json={
            "email": email,
            "password": "ValidPass1",
            "firstName": "Pytest",
            "lastName": "Bookings",
        },
        timeout=10,
    )
    assert reg.status_code == 200
    token = reg.json()["token"]
    r = requests.get(
        f"{api_base}/bookings",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    assert r.status_code == 200
    data = r.json()
    assert "bookings" in data
    assert isinstance(data["bookings"], list)


@pytest.mark.api
def test_bookings_post_requires_auth(api_base):
    """POST /api/bookings returns 401 without auth."""
    r = requests.post(
        f"{api_base}/bookings",
        json={
            "listingId": "some-id",
            "startTime": "2026-02-10T10:00:00Z",
            "endTime": "2026-02-10T12:00:00Z",
            "vehicleMake": "Toyota",
            "vehicleModel": "Camry",
            "licensePlate": "ABC1234",
        },
        timeout=10,
    )
    assert r.status_code == 401
