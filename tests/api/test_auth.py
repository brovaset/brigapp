"""
API regression tests: auth (register, login, me).
"""
import pytest
import requests


@pytest.mark.api
def test_register_validation_rejects_invalid_email(api_base):
    """POST /api/auth/register returns 400 for invalid email."""
    r = requests.post(
        f"{api_base}/auth/register",
        json={
            "email": "not-an-email",
            "password": "ValidPass1",
            "firstName": "Test",
            "lastName": "User",
        },
        timeout=10,
    )
    assert r.status_code == 400
    data = r.json()
    assert "error" in data


@pytest.mark.api
def test_register_validation_rejects_weak_password(api_base):
    """POST /api/auth/register returns 400 for weak password."""
    r = requests.post(
        f"{api_base}/auth/register",
        json={
            "email": "test@example.com",
            "password": "short",
            "firstName": "Test",
            "lastName": "User",
        },
        timeout=10,
    )
    assert r.status_code == 400
    data = r.json()
    assert "error" in data


@pytest.mark.api
def test_register_success_returns_user_and_token(api_base):
    """POST /api/auth/register with valid data returns 200, user and token."""
    email = f"pytest-reg-{id(object())}@example.com"
    r = requests.post(
        f"{api_base}/auth/register",
        json={
            "email": email,
            "password": "ValidPass1",
            "firstName": "Pytest",
            "lastName": "User",
        },
        timeout=10,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert "user" in data
    assert data["user"]["email"] == email
    assert "token" in data
    assert data["token"]


@pytest.mark.api
def test_login_requires_email_and_password(api_base):
    """POST /api/auth/login returns 400 when email or password missing."""
    r = requests.post(
        f"{api_base}/auth/login",
        json={},
        timeout=10,
    )
    assert r.status_code == 400


@pytest.mark.api
def test_login_rejects_invalid_credentials(api_base):
    """POST /api/auth/login returns 401 for wrong credentials."""
    r = requests.post(
        f"{api_base}/auth/login",
        json={"email": "nonexistent@example.com", "password": "WrongPass1"},
        timeout=10,
    )
    assert r.status_code == 401


@pytest.mark.api
def test_login_success_returns_user_and_token(api_base):
    """POST /api/auth/login with valid credentials returns 200, user and token."""
    # Create a user first
    email = f"pytest-login-{id(object())}@example.com"
    requests.post(
        f"{api_base}/auth/register",
        json={
            "email": email,
            "password": "ValidPass1",
            "firstName": "Pytest",
            "lastName": "Login",
        },
        timeout=10,
    )
    r = requests.post(
        f"{api_base}/auth/login",
        json={"email": email, "password": "ValidPass1"},
        timeout=10,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert "user" in data
    assert data["user"]["email"] == email
    assert "token" in data


@pytest.mark.api
def test_me_requires_auth(api_base):
    """GET /api/auth/me returns 401 without token."""
    r = requests.get(f"{api_base}/auth/me", timeout=10)
    assert r.status_code == 401


@pytest.mark.api
def test_me_returns_user_with_valid_token(api_base):
    """GET /api/auth/me returns 200 and user when Bearer token is valid."""
    email = f"pytest-me-{id(object())}@example.com"
    reg = requests.post(
        f"{api_base}/auth/register",
        json={
            "email": email,
            "password": "ValidPass1",
            "firstName": "Pytest",
            "lastName": "Me",
        },
        timeout=10,
    )
    assert reg.status_code == 200
    token = reg.json()["token"]
    r = requests.get(
        f"{api_base}/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    assert r.status_code == 200
    data = r.json()
    assert data.get("email") == email
