from pydantic import BaseModel


class DashboardResponse(BaseModel):
    account_id: int
    username: str
    email: str
    role: str
