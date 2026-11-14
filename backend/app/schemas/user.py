from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.-]+$")
    email: str = Field(
        min_length=3,
        max_length=255,
        pattern=r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$",
    )
    password: str = Field(min_length=8, max_length=128)


class RegistrationResponse(BaseModel):
    username: str
    message: str
