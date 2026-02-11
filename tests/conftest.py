"""
Pytest configuration and shared fixtures for BRIGAP regression tests.
"""
import os
import pytest

# Base URL for the running Next.js app (API and E2E)
BASE_URL = os.environ.get("BRIGAP_BASE_URL", "http://localhost:3000")
API_BASE = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def base_url():
    """Base URL for the app (used by pytest-playwright for E2E)."""
    return BASE_URL


@pytest.fixture(scope="session")
def api_base():
    """Base URL for API routes."""
    return API_BASE


# pytest-playwright: set base_url for E2E so page.goto("/path") uses BRIGAP_BASE_URL
@pytest.fixture(scope="session")
def browser_context_args(base_url):
    return {"base_url": base_url}
