import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING

# [*] MongoDB Configuration

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "loan_video")

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    """Initialize MongoDB connection"""
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # Create collections if they don't exist
    collections_needed = {
        "users": [("phone", ASCENDING), ("email", ASCENDING)],
        "loan_applications": [("phone", ASCENDING), ("user_id", ASCENDING)],
        "loan_offers": [("phone", ASCENDING), ("user_id", ASCENDING)],
        "video_verifications": [("phone", ASCENDING), ("user_id", ASCENDING)],
        "verification_sessions": [("session_id", ASCENDING), ("phone", ASCENDING), ("user_id", ASCENDING)]
    }
    
    for collection_name, indexes in collections_needed.items():
        if collection_name not in await db.list_collection_names():
            await db.create_collection(collection_name)
            print(f"[+] Created collection: {collection_name}")
        
        # Create indexes
        collection = db[collection_name]
        for field, index_type in indexes:
            await collection.create_index([(field, index_type)])
    
    print("[+] MongoDB connected and initialized")


async def close_mongo():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("[-] MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db
