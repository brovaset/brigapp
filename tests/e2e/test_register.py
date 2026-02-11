"""
E2E regression tests: register flow.
"""
import pytest


@pytest.mark.e2e
def test_register_page_loads(page):
    """Register page loads and shows form."""
    page.goto("/register")
    page.wait_for_load_state("networkidle")
    assert page.get_by_placeholder("John").is_visible()
    assert page.get_by_placeholder("Doe").is_visible()
    assert page.get_by_placeholder("your@email.com").is_visible()
    assert page.get_by_placeholder("••••••••").is_visible()
    assert page.get_by_role("button", name="Sign Up").is_visible()


@pytest.mark.e2e
def test_register_success_redirects_to_dashboard(page):
    """Valid registration redirects to dashboard."""
    import os
    email = f"e2e-reg-{id(object())}@example.com"
    page.goto("/register")
    page.get_by_placeholder("John").fill("E2E")
    page.get_by_placeholder("Doe").fill("User")
    page.get_by_placeholder("your@email.com").fill(email)
    page.get_by_placeholder("••••••••").fill("ValidPass1")
    page.get_by_role("button", name="Sign Up").click()
    page.wait_for_url("**/dashboard**", timeout=10000)
    assert "/dashboard" in page.url
