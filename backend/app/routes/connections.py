from fastapi import APIRouter, HTTPException, Depends
from app.db.database import get_database
from app.auth.auth_bearer import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/request", summary="Send a connection/follow request")
async def send_connection_request(target_user_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id")
    if user_id == target_user_id:
        raise HTTPException(status_code=400, detail="Cannot connect with yourself")
        
    db = get_database()
    users = db["users"]
    connections = db["connections"]
    
    target_user = await users.find_one({"_id": target_user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")
        
    existing = await connections.find_one({
        "requester_id": user_id,
        "target_id": target_user_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Request already sent or connected")
        
    request_doc = {
        "requester_id": user_id,
        "target_id": target_user_id,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    await connections.insert_one(request_doc)
    return {"message": "Connection request sent"}

@router.put("/accept", summary="Accept or reject connection request")
async def handle_connection_request(requester_id: str, action: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id")
    if action not in ["accept", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'accept' or 'reject'")
        
    db = get_database()
    connections = db["connections"]
    users = db["users"]
    
    request = await connections.find_one({
        "requester_id": requester_id,
        "target_id": user_id,
        "status": "pending"
    })
    
    if not request:
        raise HTTPException(status_code=404, detail="Connection request not found")
        
    if action == "accept":
        await connections.update_one({"_id": request["_id"]}, {"$set": {"status": "accepted", "updated_at": datetime.utcnow()}})
        
        # Increment counts
        await users.update_one({"_id": user_id}, {"$inc": {"profile.connections_count": 1, "profile.followers_count": 1}})
        await users.update_one({"_id": requester_id}, {"$inc": {"profile.connections_count": 1, "profile.following_count": 1}})
        
        return {"message": "Connection request accepted"}
    else:
        await connections.update_one({"_id": request["_id"]}, {"$set": {"status": "rejected", "updated_at": datetime.utcnow()}})
        return {"message": "Connection request rejected"}

@router.get("/followers", summary="Get list of followers")
async def get_followers(current_user: dict = Depends(get_current_user)):
    db = get_database()
    connections = db["connections"]
    users = db["users"]
    
    user_id = current_user.get("user_id")
    
    followers_cursor = connections.find({"target_id": user_id, "status": "accepted"})
    followers_list = await followers_cursor.to_list(length=100)
    
    requester_ids = [conn["requester_id"] for conn in followers_list]
    
    users_cursor = users.find({"_id": {"$in": requester_ids}}, {"password": 0})
    followers = await users_cursor.to_list(length=100)
    
    return {"followers": followers}

@router.get("/following", summary="Get list of following")
async def get_following(current_user: dict = Depends(get_current_user)):
    db = get_database()
    connections = db["connections"]
    users = db["users"]
    
    user_id = current_user.get("user_id")
    
    following_cursor = connections.find({"requester_id": user_id, "status": "accepted"})
    following_list = await following_cursor.to_list(length=100)
    
    target_ids = [conn["target_id"] for conn in following_list]
    
    users_cursor = users.find({"_id": {"$in": target_ids}}, {"password": 0})
    following = await users_cursor.to_list(length=100)
    
    return {"following": following}

@router.get("/suggested", summary="Get suggested connections")
async def get_suggested(current_user: dict = Depends(get_current_user)):
    db = get_database()
    users = db["users"]
    user_id = current_user.get("user_id")
    
    # Very basic recommendation: 5 random active users excluding self
    # In a real app, this would use vector similarity or department match
    cursor = users.aggregate([
        {"$match": {"_id": {"$ne": user_id}, "is_active": True}},
        {"$sample": {"size": 5}},
        {"$project": {"password": 0}}
    ])
    suggested = await cursor.to_list(length=5)
    
    return {"suggested": suggested}
