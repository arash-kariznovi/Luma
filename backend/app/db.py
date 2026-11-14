from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

# Resolve relative SQLite file paths against the backend directory, not the
# process's current working directory.
database_url = make_url(settings.database_url)
if (
    database_url.get_backend_name() == "sqlite"
    and database_url.database
    and database_url.database != ":memory:"
    and not database_url.database.startswith("file:")
):
    database_path = Path(database_url.database).expanduser()
    if not database_path.is_absolute():
        database_path = (Path(__file__).resolve().parents[1] / database_path).resolve()
        database_url = database_url.set(database=str(database_path))
    database_path.parent.mkdir(parents=True, exist_ok=True)

# SQLite's default thread check is disabled for use with threaded web workers.
engine_kwargs = (
    {"connect_args": {"check_same_thread": False}}
    if database_url.get_backend_name() == "sqlite"
    else {}
)
engine = create_engine(database_url, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    # Keep session cleanup reliable when request handling completes or fails.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
