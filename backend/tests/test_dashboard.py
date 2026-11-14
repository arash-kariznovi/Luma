from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings


def test_dashboard_requires_authentication_and_returns_signed_in_users_data() -> None:
    username = f"dash_{uuid4().hex[:12]}"
    email = f"{username}@example.com"

    with TestClient(app) as client:
        unauthenticated = client.get("/dashboard/data")
        assert unauthenticated.status_code == 401

        registration = client.post(
            "/register",
            json={
                "username": username,
                "email": email,
                "password": "dashboard-pass-123",
            },
        )
        assert registration.status_code == 201

        login = client.post(
            "/token",
            data={"username": email, "password": "dashboard-pass-123"},
        )
        assert login.status_code == 200
        cookie = login.headers["set-cookie"]
        assert "HttpOnly" in cookie
        assert f"SameSite={settings.auth_cookie_samesite}" in cookie
        assert ("; Secure" in cookie) is settings.auth_cookie_secure

        dashboard = client.get("/dashboard/data")
        page = client.get("/dashboard")
        script = client.get("/dashboard.js")
        logout = client.post("/logout")
        denied_after_logout = client.get("/dashboard/data")

    assert dashboard.status_code == 200
    assert dashboard.json()["username"] == username
    assert dashboard.json()["email"] == email
    assert dashboard.json()["role"] == "user"
    assert isinstance(dashboard.json()["account_id"], int)
    assert dashboard.headers["cache-control"] == "no-store"
    assert page.status_code == 404
    assert script.status_code == 404
    assert logout.status_code == 200
    assert denied_after_logout.status_code == 401
    assert "X-Content-Type-Options" in dashboard.headers
