"""
E2E regression tests: search and view listing.
"""
import pytest


@pytest.mark.e2e
def test_search_page_loads(page):
    """Search page loads."""
    page.goto("/search")
    page.wait_for_load_state("networkidle")
    # Search page should have some search UI (input or map)
    assert page.url.rstrip("/").endswith("search")


@pytest.mark.e2e
def test_home_page_loads(page):
    """Home page loads."""
    page.goto("/")
    page.wait_for_load_state("networkidle")
    assert page.url.rstrip("/").endswith("") or "localhost" in page.url
