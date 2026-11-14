from typing import Literal

import bcrypt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def get_user(db: Session, username_or_email: str) -> User | None:
    return db.scalar(
        select(User).where(
            (User.username == username_or_email) | (User.email == username_or_email)
        )
    )


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def create_user(
    db: Session, user_data: UserCreate, role: Literal["admin", "user"] = "user"
) -> User:
    user = User(
        username=user_data.username,
        email=user_data.email,
        role=role,
        password_hash=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
