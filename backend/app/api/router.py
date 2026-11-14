from fastapi import APIRouter

from app.api.routes import auth_api, dashboard, health, tasks

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth_api.router)
api_router.include_router(dashboard.router)
api_router.include_router(tasks.router)
