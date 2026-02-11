"""
API regression tests: listings (GET public, GET by id).
"""
import pytest
import requests


@pytest.mark.api
def test_listings_get_returns_200(api_base):
    """GET /api/listings returns 200 and array of listings."""
    r = requests.get(f"{api_base}/listings", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "listings" in data
    assert isinstance(data["listings"], list)


@pytest.mark.api
def test_listings_get_with_query_params(api_base):
    """GET /api/listings with lat, lng, radius returns 200."""
    r = requests.get(
        f"{api_base}/listings",
        params={"lat": 40.7, "lng": -74.0, "radius": "5"},
        timeout=10,
    )
    assert r.status_code == 200
    data = r.json()
    assert "listings" in data


@pytest.mark.api
def test_listing_by_id_returns_404_for_invalid_id(api_base):
    """GET /api/listings/[id] returns 404 for non-existent id."""
    r = requests.get(f"{api_base}/listings/nonexistent-id-12345", timeout=10)
    assert r.status_code == 404
