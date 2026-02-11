"""
E2E regression tests: login flow.
"""
import pytest


@pytest.mark.e2e
def test_login_page_loads(page):
    """Login page loads and shows form."""
    page.goto("/login")
    page.wait_for_load_state("networkidle")
    assert page.get_by_placeholder("your@email.com").is_visible()
    assert page.get_by_placeholder("••••••••").is_visible()
    assert page.get_by_role("button", name="Log In").is_visible()


@pytest.mark.e2e
def test_login_success_redirects_to_dashboard(page):
    """Valid login redirects to dashboard."""
    # Create user via API (same base origin)
    import requests
    import os
    base = os.environ.get("BRIGAP_BASE_URL", "http://localhost:3000")
    email = f"e2e-login-{id(object())}@example.com"
    requests.post(
        f"{base}/api/auth/register",
        json={
            "email": email,
            "password": "ValidPass1",
            "firstName": "E2E",
            "lastName": "Login",
        },
        timeout=10,
    )
    page.goto("/login")
    page.get_by_placeholder("your@email.com").fill(email)
    page.get_by_placeholder("••••••••").fill("ValidPass1")
    page.get_by_role("button", name="Log In").click()
    page.wait_for_url("**/dashboard**", timeout=10000)
    assert "/dashboard" in page.url
