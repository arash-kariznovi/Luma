from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_docs_route_allows_swagger_assets_without_relaxing_other_routes() -> None:
    docs_response = client.get("/docs")
    docs_csp = docs_response.headers["content-security-policy"]

    assert docs_response.status_code == 200
    assert "https://cdn.jsdelivr.net" in docs_csp
    assert "'unsafe-inline'" in docs_csp
    assert "swagger-ui" in docs_response.text

    health_csp = client.get("/health").headers["content-security-policy"]
    assert "https://cdn.jsdelivr.net" not in health_csp
    assert "script-src 'self';" in health_csp
