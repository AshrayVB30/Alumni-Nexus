from fastapi import APIRouter, HTTPException, Depends
from app.schemas.user import UserCreate, UserLogin
from app.db.database import get_database
from app.auth.jwt_handler import hash_password, verify_password, sign_jwt
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/register", summary="Create new user")
async def register(user: UserCreate):
    db = get_database()
    users_collection = db["users"]
    
    # Check email
    existing_email = await users_collection.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Check USN
    existing_usn = await users_collection.find_one({"usn": user.usn})
    if existing_usn:
        raise HTTPException(status_code=400, detail="USN already registered")
        
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(user.password)
    
    new_user = {
        "_id": user_id,
        "email": user.email,
        "name": user.name,
        "usn": user.usn,
        "year_of_passing": user.year_of_passing,
        "phone_number": user.phone_number,
        "department": user.department,
        "password": hashed_pwd,
        "role": user.role,
        "is_verified": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "profile": {
            "profile_photo": None,
            "bio": None,
            "current_company": None,
            "designation": None,
            "location": None,
            "followers_count": 0,
            "following_count": 0,
            "connections_count": 0,
            "skills": [],
            "interests": [],
            "career_interests": [],
            "social_links": {"linkedin": None, "github": None, "portfolio": None},
            "academic_info": {"college_name": None, "branch": None, "current_year": None, "cgpa": None} if user.role.lower() == "student" else None,
            "projects": [],
            "education_info": {"college_name": None, "degree": None, "branch": None, "graduation_year": None} if user.role.lower() == "alumni" else None,
            "professional_info": {"company_name": None, "job_title": None, "years_experience": 0, "industry": None} if user.role.lower() == "alumni" else None,
            "mentorship_prefs": {"is_available": False, "domains": [], "availability": None} if user.role.lower() == "alumni" else None,
            "verification_url": None
        }
    }
    
    await users_collection.insert_one(new_user)
    
    return {"message": "User registered successfully", "user_id": user_id}

@router.post("/login", summary="Login user and receive JWT")
async def login(user: UserLogin):
    db = get_database()
    users_collection = db["users"]
    
    if not user.email and not user.usn:
        raise HTTPException(status_code=400, detail="Must provide email or USN")
        
    query = {}
    if user.email:
        query["email"] = user.email
    elif user.usn:
        query["usn"] = user.usn
        
    print(f"DEBUG: Login Attempt - Payload: {user.dict()}, Query: {query}")
    existing_user = await users_collection.find_one(query)
    
    if not existing_user:
        print(f"DEBUG: User not found for query: {query}")
        raise HTTPException(status_code=400, detail="Invalid credentials")
        
    if not verify_password(user.password, existing_user["password"]):
        print(f"DEBUG: Password mismatch for user: {existing_user.get('email') or existing_user.get('usn')}")
        raise HTTPException(status_code=400, detail="Invalid credentials")
        
    if not existing_user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
        
    token_data = sign_jwt(existing_user["_id"], existing_user["role"])
    
    return {
        "access_token": token_data["access_token"],
        "token_type": "bearer",
        "user_id": existing_user["_id"],
        "role": existing_user["role"],
        "name": existing_user.get("name"),
        "usn": existing_user.get("usn"),
        "profile_photo": existing_user.get("profile", {}).get("profile_photo")
    }
