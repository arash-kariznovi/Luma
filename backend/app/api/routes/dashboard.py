from fastapi import APIRouter, Depends, Response

from app.core.security import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardResponse

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard/data", response_model=DashboardResponse)
async def read_dashboard(
    response: Response, user: User = Depends(get_current_user)
) -> DashboardResponse:
    response.headers["Cache-Control"] = "no-store"
    return DashboardResponse(
        account_id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
    )
