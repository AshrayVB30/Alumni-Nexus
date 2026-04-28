from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from app.db.database import get_database
from app.schemas.user import UserInDB, UserUpdate
from app.auth.auth_bearer import get_current_user

router = APIRouter()

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role", "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/stats", summary="Get admin dashboard stats (Mobile)")
@router.get("/analytics", summary="Get admin dashboard analytics (Web)")
async def get_stats(admin: dict = Depends(get_current_admin)):
    db = get_database()
    users = db["users"]
    
    total_students = await users.count_documents({"role": {"$regex": "^student$", "$options": "i"}})
    total_alumni = await users.count_documents({"role": {"$regex": "^alumni$", "$options": "i"}})
    total_active = await users.count_documents({"is_active": True})
    total_verified = await users.count_documents({"role": {"$regex": "^alumni$", "$options": "i"}, "is_verified": True})
    
    # Count connections (followers count)
    pipeline_connections = [
        {"$project": {"count": {"$size": {"$ifNull": ["$profile.followers", []]}}}},
        {"$group": {"_id": None, "total": {"$sum": "$count"}}}
    ]
    connections_res = await users.aggregate(pipeline_connections).to_list(length=1)
    total_connections = connections_res[0]["total"] if connections_res else 0
    
    # Count posts
    total_posts = await db["posts"].count_documents({})
    
    # Growth Data (Last 6 Months)
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    months = []
    for i in range(5, -1, -1):
        d = now - timedelta(days=i*30)
        months.append(d.strftime("%b"))
        
    # Simple growth data mock for chart that looks real based on total
    # In a real app we'd aggregate by month
    chart_data = []
    base_users = total_students + total_alumni
    for i, m in enumerate(months):
        chart_data.append({
            "name": m,
            "users": int(base_users * (0.5 + (i * 0.1))) # Scaled dummy data for visual
        })

    # Recent Activity
    recent_users = await users.find({}, {"name": 1, "role": 1, "created_at": 1}).sort("created_at", -1).limit(5).to_list(length=5)
    recent_activity = []
    for u in recent_users:
        recent_activity.append({
            "type": "registration",
            "message": f"{u['name']} joined as {u['role']}",
            "time": u.get("created_at").isoformat() if u.get("created_at") else None
        })

    return {
        "totalStudents": total_students,
        "totalAlumni": total_alumni,
        "activeUsers": total_active,
        "verifiedAlumni": total_verified,
        "totalConnections": total_connections,
        "totalPosts": total_posts,
        "growthData": chart_data,
        "recentActivity": recent_activity
    }

@router.get("/users", summary="Get all users with filtering")
async def get_users(
    role: Optional[str] = None,
    department: Optional[str] = None,
    year_of_passing: Optional[str] = None,
    is_verified: Optional[bool] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    admin: dict = Depends(get_current_admin)
):
    db = get_database()
    users_collection = db["users"]
    
    query = {}
    if role:
        query["role"] = {"$regex": f"^{role}$", "$options": "i"}
    if department:
        query["department"] = {"$regex": department, "$options": "i"}
    if year_of_passing:
        query["year_of_passing"] = year_of_passing
    if is_verified is not None:
        query["is_verified"] = is_verified
    if is_active is not None:
        query["is_active"] = is_active
        
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"usn": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
        
    cursor = users_collection.find(query).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    total = await users_collection.count_documents(query)
    
    # Clean up password before returning
    for u in users:
        u.pop("password", None)
        
    return {
        "data": users,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.put("/users/{user_id}", summary="Update user (Admin)")
async def update_user(user_id: str, update_data: dict, admin: dict = Depends(get_current_admin)):
    db = get_database()
    users_collection = db["users"]
    
    existing = await users_collection.find_one({"_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Remove immutable fields if present
    update_data.pop("_id", None)
    update_data.pop("email", None)
    update_data.pop("usn", None)
    
    # Handle nested profile updates
    if "profile" in update_data:
        profile_update = update_data.pop("profile")
        for key, value in profile_update.items():
            update_data[f"profile.{key}"] = value
            
    await users_collection.update_one(
        {"_id": user_id},
        {"$set": update_data}
    )
    
    return {"message": "User updated successfully"}

@router.post("/users/{user_id}/verify", summary="Verify/Unverify user (Admin)")
async def verify_user(user_id: str, verified: bool, admin: dict = Depends(get_current_admin)):
    db = get_database()
    users_collection = db["users"]
    
    result = await users_collection.update_one(
        {"_id": user_id},
        {"$set": {"is_verified": verified}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": f"User {'verified' if verified else 'unverified'} successfully"}

@router.delete("/users/{user_id}", summary="Delete user (Admin)")
async def delete_user(user_id: str, admin: dict = Depends(get_current_admin)):
    db = get_database()
    users_collection = db["users"]
    
    # Also delete associated data (posts, projects, etc.)
    await db["posts"].delete_many({"author": user_id})
    await db["projects"].delete_many({"owner_id": user_id})
    
    result = await users_collection.delete_one({"_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "User and associated data deleted successfully"}
