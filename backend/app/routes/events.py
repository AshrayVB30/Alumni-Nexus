from fastapi import APIRouter, Depends
from app.db.database import get_database

router = APIRouter()

@router.get("/", summary="Get events")
async def get_events():
    return {"events": []}
