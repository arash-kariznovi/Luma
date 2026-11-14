from uuid import uuid4

from fastapi.testclient import TestClient

from app.core.config import settings
from app.db import SessionLocal
from app.main import app
from app.services.users import get_user


def test_registration_assigns_user_role_and_seeded_admin_is_admin() -> None:
    username = f"api_{uuid4().hex[:12]}"
    email = f"{username}@example.com"

    with TestClient(app) as client:
        response = client.post(
            "/register",
            json={
                "username": username,
                "email": email,
                "password": "admin1234",
            },
        )

    assert response.status_code == 201
    with SessionLocal() as db:
        registered_user = get_user(db, username)
        seeded_admin = get_user(db, settings.demo_username)

        assert registered_user is not None
        assert registered_user.role == "user"
        assert seeded_admin is not None
        assert seeded_admin.role == "admin"
