import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["alumni_nexus"]
    users = await db["users"].find({}).to_list(10)
    for u in users:
        print(f"ID: {u['_id']}, Name: {u['name']}, Role: {u['role']}, Verified: {u.get('is_verified')}")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
