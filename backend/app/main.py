from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, select, text
from starlette.middleware.base import RequestResponseEndpoint

from app.api.router import api_router
from app.core.config import settings
from app.db import Base, SessionLocal, engine
from app.models.task import Task
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.users import create_user, get_user


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        columns = {column["name"] for column in inspect(conn).get_columns("users")}
        if "email" not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(255)"))
            rows = conn.execute(
                text("SELECT id, username FROM users WHERE email IS NULL")
            ).fetchall()
            for user_id, username in rows:
                conn.execute(
                    text("UPDATE users SET email = :email WHERE id = :id"),
                    {"email": f"{username}@localhost.local", "id": user_id},
                )
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users(email)"))
        if "role" not in columns:
            conn.execute(
                text("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'")
            )
            conn.execute(
                text("UPDATE users SET role = 'admin' WHERE username = :username"),
                {"username": settings.demo_username},
            )

    with SessionLocal() as db:
        if get_user(db, settings.demo_username) is None:
            create_user(
                db,
                UserCreate(
                    username=settings.demo_username,
                    email=settings.demo_email,
                    password=settings.demo_password,
                ),
                role="admin",
            )
        seed_users = db.scalars(
            select(User)
            .order_by((User.username == settings.demo_username).desc(), User.id)
            .limit(4)
        ).all()
        sample_tasks = (
            ("Review weekly priorities", "Review goals and choose the top priorities."),
            ("Update project notes", "Record progress and next steps for the team."),
        )
        for user in seed_users:
            if db.scalar(select(Task.id).where(Task.user_id == user.id).limit(1)) is None:
                db.add_all(
                    [
                        Task(
                            user_id=user.id,
                            title=title,
                            description=f"{description} Assigned to {user.username}.",
                            status=status,
                        )
                        for (title, description), status in zip(
                            sample_tasks, ("pending", "in_progress"), strict=True
                        )
                    ]
                )
        db.commit()
    yield


def create_app() -> FastAPI:
    application = FastAPI(title=settings.app_name, lifespan=lifespan)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.middleware("http")
    async def add_security_headers(
        request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        response = await call_next(request)
        if request.url.path in {"/docs", "/redoc", "/docs/oauth2-redirect"}:
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; base-uri 'self'; object-src 'none'; "
                "frame-ancestors 'none'; form-action 'self'; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "img-src 'self' data: https://fastapi.tiangolo.com; "
                "connect-src 'self'"
            )
        else:
            response.headers.setdefault(
                "Content-Security-Policy",
                "default-src 'self'; base-uri 'self'; object-src 'none'; "
                "frame-ancestors 'none'; form-action 'self'; "
                "script-src 'self'; style-src 'self' 'unsafe-inline'",
            )
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault(
            "Permissions-Policy", "camera=(), microphone=(), geolocation=()"
        )
        if settings.auth_cookie_secure:
            response.headers.setdefault(
                "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
            )
        if (
            request.url.path in {"/token", "/logout", "/dashboard/data"}
            or request.url.path.startswith("/tasks")
        ):
            response.headers["Cache-Control"] = "no-store"
        return response

    application.include_router(api_router)

    @application.get("/", tags=["root"])
    async def read_root() -> dict[str, str]:
        return {"message": "Hello, World!"}

    return application


app = create_app()
