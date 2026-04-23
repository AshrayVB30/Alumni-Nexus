from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.db.database import get_database
from app.schemas.user import UserUpdate
from app.ai.mentor_match import match_users, sync_users_to_faiss
import asyncio

router = APIRouter()

@router.get("/{user_id}", summary="Get user profile")
async def get_user(user_id: str):
    db = get_database()
    users_collection = db["users"]
    user = await users_collection.find_one({"_id": user_id}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}/profile", summary="Update user profile")
async def update_profile(user_id: str, data: UserUpdate):
    db = get_database()
    users_collection = db["users"]
    
    update_data = {}
    if data.name:
        update_data["name"] = data.name
    if data.profile:
        update_data["profile"] = data.profile.dict()
        
    if not update_data:
         return {"message": "No changes provided"}
         
    result = await users_collection.update_one(
        {"_id": user_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Re-sync FAISS if Alumni
    user = await users_collection.find_one({"_id": user_id})
    if user and user.get("role") == "Alumni":
        asyncio.create_task(sync_users_to_faiss())
        
    return {"message": "Profile updated successfully"}

@router.get("/", summary="Get all users")
async def get_all_users(role: str = None):
    db = get_database()
    users_collection = db["users"]
    query = {}
    if role:
        query["role"] = role
    
    cursor = users_collection.find(query, {"password": 0})
    users = []
    async for user in cursor:
        users.append(user)
    return users

@router.get("/{user_id}/mentors", summary="Get top 5 mentor recommendations")
async def get_mentors(user_id: str):
    matches = await match_users(user_id, top_k=5)
    return matches
