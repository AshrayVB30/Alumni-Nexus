
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load env from root
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

async def main():
    uri = os.getenv("URI")
    print(f"Connecting to: {uri}")
    client = AsyncIOMotorClient(uri)
    dbs = await client.list_database_names()
    print(f"Databases: {dbs}")
    db = client["alumni_nexus"]
    users = await db["users"].find({}, {"password": 0}).to_list(10)
    for u in users:
        print(u)

if __name__ == "__main__":
    asyncio.run(main())
