import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from app.auth.jwt_handler import hash_password
import uuid
from datetime import datetime

# Load .env from the root directory
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("URI", "mongodb://localhost:27017/alumni_nexus")
DB_NAME = "alumni_nexus"

async def seed():
    print(f"Connecting to MongoDB at {MONGO_URI}...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    users_coll = db["users"]
    
    # Check if admin exists
    admin = await users_coll.find_one({"email": "admin@nexus.com"})
    if not admin:
        admin_id = str(uuid.uuid4())
        await users_coll.insert_one({
            "_id": admin_id,
            "email": "admin@nexus.com",
            "name": "System Admin",
            "usn": "ADMIN001",
            "password": hash_password("Admin@123"),
            "role": "Admin",
            "is_verified": True,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "profile": {
                "bio": "Platform Administrator",
                "followers_count": 0,
                "following_count": 0,
                "connections_count": 0,
                "skills": ["Management", "Security"],
                "social_links": {"linkedin": None, "github": None, "portfolio": None}
            }
        })
        print("Admin user created: admin@nexus.com / Admin@123")
    else:
        print("Admin already exists")

    # Create a student for testing
    student = await users_coll.find_one({"email": "student@nexus.com"})
    if not student:
        student_id = str(uuid.uuid4())
        await users_coll.insert_one({
            "_id": student_id,
            "email": "student@nexus.com",
            "name": "Test Student",
            "usn": "1AB22CS001",
            "password": hash_password("Student@123"),
            "role": "Student",
            "is_verified": True,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "profile": {
                "bio": "I am a computer science student.",
                "followers_count": 0,
                "following_count": 0,
                "connections_count": 0,
                "skills": ["Python", "React"],
                "social_links": {"linkedin": None, "github": None, "portfolio": None},
                "academic_info": {"college_name": "Nexus Institute", "branch": "CSE", "current_year": "3", "cgpa": 8.5}
            }
        })
        print("Student user created: student@nexus.com / Student@123")
    else:
        print("Student already exists")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
