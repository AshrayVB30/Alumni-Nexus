from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends, Query
from typing import List, Dict, Any
from app.db.database import get_database
from app.auth.jwt_handler import decode_jwt
import json
from datetime import datetime

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps user_id to WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"DEBUG: User {user_id} connected. Total active: {len(self.active_connections)}")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"DEBUG: User {user_id} disconnected. Total active: {len(self.active_connections)}")

    async def send_personal_message(self, data: dict, user_id: str):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_text(json.dumps(data, default=str))
                print(f"DEBUG: Sent message to {user_id}")
            except Exception as e:
                print(f"DEBUG: Failed to send to {user_id}: {e}")
                self.disconnect(user_id)

manager = ConnectionManager()

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    # Validate token
    payload = decode_jwt(token)
    if not payload:
        print("DEBUG: WS Connection denied - Invalid Token")
        await websocket.close(code=4001)
        return
    
    user_id = payload.get("user_id")
    await manager.connect(websocket, user_id)
    
    db = get_database()
    messages_collection = db["messages"]
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            receiver_id = message_data.get("receiver_id")
            content = message_data.get("message")
            
            if not receiver_id or not content:
                continue
            
            print(f"DEBUG: Message from {user_id} to {receiver_id}: {content[:20]}...")
            
            # Save to db
            msg_doc = {
                "sender_id": user_id,
                "receiver_id": receiver_id,
                "message": content,
                "timestamp": datetime.utcnow()
            }
            await messages_collection.insert_one(msg_doc)
            
            # Use the doc (which now has _id) for sending
            msg_doc["_id"] = str(msg_doc["_id"])
            
            # Send to receiver if online
            await manager.send_personal_message(msg_doc, receiver_id)
            # Send back to self for confirmation/sync
            await manager.send_personal_message(msg_doc, user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"DEBUG: WS Error for {user_id}: {e}")
        manager.disconnect(user_id)

@router.get("/history/{other_id}", summary="Get chat history with a specific user")
async def get_chat_history(other_id: str, token: str = Query(...)):
    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("user_id")
    db = get_database()
    messages_collection = db["messages"]
    
    # Find messages where user is either sender or receiver and other_id is the counterpart
    cursor = messages_collection.find({
        "$or": [
            {"sender_id": user_id, "receiver_id": other_id},
            {"sender_id": other_id, "receiver_id": user_id}
        ]
    }).sort("timestamp", 1)
    
    messages = []
    async for msg in cursor:
        msg["_id"] = str(msg["_id"])
        messages.append(msg)
        
    return messages

@router.get("/conversations", summary="Get list of users with active conversations")
async def get_conversations(token: str = Query(...)):
    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("user_id")
    db = get_database()
    messages_collection = db["messages"]
    users_collection = db["users"]
    
    # Use aggregation to find unique counterpart IDs
    pipeline = [
        {"$match": {"$or": [{"sender_id": user_id}, {"receiver_id": user_id}]}},
        {"$project": {
            "counterpart": {"$cond": [{"$eq": ["$sender_id", user_id]}, "$receiver_id", "$sender_id"]},
            "timestamp": 1,
            "message": 1
        }},
        {"$sort": {"timestamp": -1}},
        {"$group": {
            "_id": "$counterpart",
            "last_message": {"$first": "$message"},
            "timestamp": {"$first": "$timestamp"}
        }}
    ]
    
    conversations = []
    cursor = messages_collection.aggregate(pipeline)
    async for conv in cursor:
        counterpart_id = conv["_id"]
        # Fetch user details for the counterpart
        cp_user = await users_collection.find_one({"_id": counterpart_id}, {"password": 0})
        if cp_user:
            conversations.append({
                "id": counterpart_id,
                "name": cp_user.get("name") or cp_user.get("email"),
                "email": cp_user.get("email"),
                "last_message": conv["last_message"],
                "timestamp": conv["timestamp"]
            })
            
    return conversations
