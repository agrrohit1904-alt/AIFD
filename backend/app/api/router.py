from fastapi import APIRouter
from app.api.endpoints import process

api_router = APIRouter()
api_router.include_router(process.router, prefix="/document", tags=["Document Processing"])
