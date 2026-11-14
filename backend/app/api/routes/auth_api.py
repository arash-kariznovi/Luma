from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_user
from app.db import get_db
from app.models.user import User
from app.schemas.auth import Token, UserResponse
from app.schemas.user import RegistrationResponse, UserCreate
from app.services.auth import authenticate_user
from app.services.users import create_user, get_user, get_user_by_email

router = APIRouter(tags=["auth"])


@router.post(
    "/register",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    user_data: UserCreate, db: Session = Depends(get_db)
) -> RegistrationResponse:
    if get_user(db, user_data.username) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )
    if get_user_by_email(db, user_data.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        )
    try:
        user = create_user(db, user_data)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists",
        ) from exc
    return RegistrationResponse(
        username=user.username, message="User registered successfully"
    )


@router.post("/token", response_model=Token)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    token = authenticate_user(db, form_data.username, form_data.password)
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=settings.token_expire_minutes * 60,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
        path="/",
    )
    response.headers["Cache-Control"] = "no-store"
    return Token(access_token=token, token_type="bearer")


@router.post("/logout")
async def logout(response: Response) -> dict[str, str]:
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
    )
    return {"message": "Signed out"}


@router.get("/protected", response_model=UserResponse)
async def protected_route(user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(message=f"Welcome, {user.username}!")
