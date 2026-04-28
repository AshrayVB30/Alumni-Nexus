from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.db.database import get_database
from app.schemas.user import UserUpdate
from app.ai.mentor_match import match_users, sync_users_to_faiss
import asyncio

import re
from fastapi import Depends
from app.auth.auth_bearer import get_current_user

router = APIRouter()

@router.get("/directory", summary="Get verified alumni directory")
async def get_directory(
    search: str = None,
    department: str = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    users_collection = db["users"]
    
    # We use "Alumni" because the registration sets role to "Alumni"
    query = {"role": {"$in": ["alumni", "Alumni"]}, "is_verified": True, "is_active": True}
    
    if search:
        search_regex = re.compile(search, re.IGNORECASE)
        query["$or"] = [
            {"name": search_regex},
            {"profile.current_company": search_regex},
            {"profile.designation": search_regex}
        ]
        
    if department:
        query["department"] = department
        
    total = await users_collection.count_documents(query)
    cursor = users_collection.find(query, {"password": 0}).skip(skip).limit(limit)
    users = []
    async for user in cursor:
        users.append(user)
        
    return {"data": users, "total": total}


@router.get("/{user_id}", summary="Get user profile")
async def get_user(user_id: str):
    print(f"DEBUG: Requesting profile for user_id: {user_id}")
    db = get_database()
    users_collection = db["users"]
    user = await users_collection.find_one({"_id": user_id}, {"password": 0})
    if not user:
        print(f"DEBUG: User {user_id} not found")
        raise HTTPException(status_code=404, detail="User not found")
    print(f"DEBUG: Found user: {user.get('name')}")
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
