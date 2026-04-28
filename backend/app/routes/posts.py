from fastapi import APIRouter, HTTPException
from typing import List
from ..db.database import get_database
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()

class PostCreate(BaseModel):
    content: str
    author: str # User ID

class CommentCreate(BaseModel):
    content: str
    author: str

@router.post("/", summary="Create a new discussion post")
async def create_post(post: PostCreate):
    db = get_database()
    posts_coll = db["posts"]
    users_coll = db["users"]
    
    # Fetch author name
    user = await users_coll.find_one({"_id": post.author})
    author_name = user.get("name", "Unknown") if user else "Unknown"
    
    post_id = str(uuid.uuid4())
    
    new_post = {
        "_id": post_id,
        "content": post.content,
        "author": post.author,
        "author_name": author_name,
        "comments": [],
        "likes": [],
        "timestamp": datetime.utcnow()
    }
    await posts_coll.insert_one(new_post)
    return {"message": "Post created", "id": post_id}

@router.get("/", summary="List all posts")
async def list_posts():
    db = get_database()
    posts_coll = db["posts"]
    cursor = posts_coll.find().sort("timestamp", -1)
    posts = await cursor.to_list(length=100)
    return posts

@router.post("/{post_id}/comments", summary="Add a comment to a post")
async def add_comment(post_id: str, comment: CommentCreate):
    db = get_database()
    posts_coll = db["posts"]
    users_coll = db["users"]
    
    # Fetch author name
    user = await users_coll.find_one({"_id": comment.author})
    author_name = user.get("name", "Unknown") if user else "Unknown"
    
    result = await posts_coll.update_one(
        {"_id": post_id},
        {"$push": {"comments": {
            "author": comment.author, 
            "author_name": author_name,
            "content": comment.content, 
            "timestamp": datetime.utcnow()
        }}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
        
    return {"message": "Comment added successfully"}

@router.post("/{post_id}/like", summary="Like a post")
async def like_post(post_id: str, user_id: str):
    db = get_database()
    posts_coll = db["posts"]
    
    result = await posts_coll.update_one(
        {"_id": post_id},
        {"$addToSet": {"likes": user_id}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
        
    return {"message": "Post liked"}
