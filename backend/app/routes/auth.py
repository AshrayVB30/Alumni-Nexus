from fastapi import APIRouter, HTTPException, Depends
from app.schemas.user import UserCreate, UserLogin
from app.db.database import get_database
from app.auth.jwt_handler import hash_password, verify_password, sign_jwt
import uuid

router = APIRouter()

@router.post("/register", summary="Create new user")
async def register(user: UserCreate):
    db = get_database()
    users_collection = db["users"]
    
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(user.password)
    
    new_user = {
        "_id": user_id,
        "email": user.email,
        "name": user.name,
        "password": hashed_pwd,
        "role": user.role,
        "profile": {
            "bio": None,
            "skills": [],
            "interests": [],
            "social_links": {"linkedin": None, "github": None},
            "academic_info": {"college_name": None, "branch": None, "current_year": None, "cgpa": None} if user.role == "Student" else None,
            "projects": [],
            "education_info": {"college_name": None, "degree": None, "branch": None, "graduation_year": None} if user.role == "Alumni" else None,
            "professional_info": {"company_name": None, "job_title": None, "years_experience": 0, "industry": None} if user.role == "Alumni" else None,
            "mentorship_prefs": {"is_available": False, "domains": [], "availability": None} if user.role == "Alumni" else None
        }
    }
    
    await users_collection.insert_one(new_user)
    
    # Do not return password
    return {"message": "User registered successfully", "user_id": user_id}

@router.post("/login", summary="Login user and receive JWT")
async def login(user: UserLogin):
    db = get_database()
    users_collection = db["users"]
    
    existing_user = await users_collection.find_one({"email": user.email})
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    if not verify_password(user.password, existing_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    token_data = sign_jwt(existing_user["_id"], existing_user["role"])
    
    return {
        "access_token": token_data["access_token"],
        "token_type": "bearer",
        "user_id": existing_user["_id"],
        "role": existing_user["role"],
        "name": existing_user.get("name")
    }
