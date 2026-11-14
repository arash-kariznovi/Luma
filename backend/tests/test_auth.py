from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_login_and_protected_route() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/token",
            data={"username": "admin", "password": "admin1234"},
        )

        assert response.status_code == 200
        token = response.json()["access_token"]

        protected = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert protected.status_code == 200
