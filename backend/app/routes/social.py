from fastapi import APIRouter, HTTPException, Depends
from app.db.database import get_database
from app.auth.auth_bearer import get_current_user
from typing import Dict

router = APIRouter()

@router.post("/{user_id}/follow", summary="Follow a user")
async def follow_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if user_id == current_user["user_id"]:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    db = get_database()
    users_collection = db["users"]
    
    target_user = await users_collection.find_one({"_id": user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Rule: Students can follow Alumni, but Students cannot follow Students
    current_role = (current_user.get("role") or "").lower()
    target_role = (target_user.get("role") or "").lower()
    
    if current_role == "student" and target_role == "student":
        raise HTTPException(status_code=403, detail="Students cannot follow other students")

    # Update current user's following list
    await users_collection.update_one(
        {"_id": current_user["user_id"]},
        {
            "$addToSet": {"profile.following": user_id},
            "$inc": {"profile.following_count": 1}
        }
    )
    
    # Update target user's followers list
    await users_collection.update_one(
        {"_id": user_id},
        {
            "$addToSet": {"profile.followers": current_user["user_id"]},
            "$inc": {"profile.followers_count": 1}
        }
    )
    
    return {"message": f"Successfully followed {target_user.get('name')}"}

@router.post("/{user_id}/unfollow", summary="Unfollow a user")
async def unfollow_user(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    users_collection = db["users"]
    
    # Update current user's following list
    result = await users_collection.update_one(
        {"_id": current_user["user_id"]},
        {
            "$pull": {"profile.following": user_id},
            "$inc": {"profile.following_count": -1}
        }
    )
    
    # Update target user's followers list
    await users_collection.update_one(
        {"_id": user_id},
        {
            "$pull": {"profile.followers": current_user["user_id"]},
            "$inc": {"profile.followers_count": -1}
        }
    )
    
    return {"message": "Successfully unfollowed user"}
@router.get("/{user_id}/is_following", summary="Check if following a user")
async def check_following(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    users_collection = db["users"]
    
    user = await users_collection.find_one({"_id": current_user["user_id"]})
    following = user.get("profile", {}).get("following", [])
    
    return {"is_following": user_id in following}
