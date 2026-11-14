import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[2] / "database" / "users.db"


class Settings:
    app_name: str = os.getenv("APP_NAME", "FastAPI Microservice")
    auth_secret_key: str = os.getenv("AUTH_SECRET_KEY", "development-only-change-me")
    token_expire_minutes: int = int(os.getenv("TOKEN_EXPIRE_MINUTES", "30"))
    auth_cookie_secure: bool = os.getenv("AUTH_COOKIE_SECURE", "false").lower() in {
        "1",
        "true",
        "yes",
    }
    auth_cookie_samesite: str = os.getenv("AUTH_COOKIE_SAMESITE", "lax").lower()
    demo_username: str = os.getenv("DEMO_USERNAME", "admin")
    demo_email: str = os.getenv("DEMO_EMAIL", "admin@example.com")
    demo_password: str = os.getenv("DEMO_PASSWORD", "admin")
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DATABASE_PATH}")
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
        ).split(",")
        if origin.strip()
    ]


settings = Settings()

if settings.auth_cookie_samesite not in {"strict", "lax", "none"}:
    raise ValueError("AUTH_COOKIE_SAMESITE must be 'strict', 'lax', or 'none'")
if settings.auth_cookie_samesite == "none" and not settings.auth_cookie_secure:
    raise ValueError("AUTH_COOKIE_SECURE must be true when AUTH_COOKIE_SAMESITE is 'none'")
