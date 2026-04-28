from fastapi import APIRouter, Depends
from app.db.database import get_database

router = APIRouter()

@router.get("/", summary="Get placements")
async def get_placements():
    return {"placements": []}
