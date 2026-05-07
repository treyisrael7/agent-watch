from fastapi import APIRouter

from app.api.routes.traces import router as traces_router

api_router = APIRouter()
api_router.include_router(traces_router)
