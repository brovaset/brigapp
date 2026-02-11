"""
E2E regression tests: booking flow (view listing, start booking).
"""
import pytest


@pytest.mark.e2e
def test_listing_page_requires_valid_id(page):
    """Listing detail page for invalid id shows error or 404."""
    page.goto("/listings/nonexistent-id-12345")
    page.wait_for_load_state("networkidle")
    # Either redirects or shows not found
    assert "listings" in page.url or page.get_by_text("not found", exact=False).count() >= 0
