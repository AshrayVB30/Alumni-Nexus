import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load .env from the parent directory
env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Should be loaded from environment properly in production app
# Using values provided in instructions
# Loaded from environment variable 'URI'
MONGO_URI = os.getenv("URI", "mongodb://localhost:27017/alumni_nexus")
DB_NAME = "alumni_nexus"
class Database:
    client: AsyncIOMotorClient = None
    db = None

db_config = Database()

async def connect_to_mongo():
    print(f"Connecting to MongoDB at {MONGO_URI}...")
    db_config.client = AsyncIOMotorClient(MONGO_URI)
    db_config.db = db_config.client[DB_NAME]
    print("Connected to MongoDB!")

async def close_mongo_connection():
    if db_config.client:
        db_config.client.close()
        print("Closed MongoDB connection.")

def get_database():
    return db_config.db
