"""
MongoDB connection and session management
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING
from app.core.config import settings

# Global MongoDB instances
_client: AsyncIOMotorClient = None
_db: AsyncIOMotorDatabase = None


async def connect_to_mongo() -> None:
    """
    Initialize MongoDB connection and create collections/indexes
    """
    global _client, _db
    
    _client = AsyncIOMotorClient(settings.MONGODB_URL)
    _db = _client[settings.DATABASE_NAME]
    
    # Define collections with their required indexes
    collections_config = {
        "users": [
            ("phone", ASCENDING),
            ("email", ASCENDING)
        ],
        "loan_applications": [
            ("phone", ASCENDING),
            ("user_id", ASCENDING)
        ],
        "loan_offers": [
            ("phone", ASCENDING),
            ("user_id", ASCENDING)
        ],
        "video_verifications": [
            ("phone", ASCENDING),
            ("user_id", ASCENDING)
        ],
        "verification_sessions": [
            ("session_id", ASCENDING),
            ("phone", ASCENDING),
            ("user_id", ASCENDING)
        ]
    }
    
    # Create collections and indexes
    existing_collections = await _db.list_collection_names()
    
    for collection_name, indexes in collections_config.items():
        if collection_name not in existing_collections:
            await _db.create_collection(collection_name)
            print(f"[+] Created collection: {collection_name}")
        
        # Create indexes for the collection
        collection = _db[collection_name]
        for field, index_type in indexes:
            await collection.create_index([(field, index_type)])
    
    print("[+] MongoDB connected and initialized")


async def close_mongo() -> None:
    """
    Close MongoDB connection gracefully
    """
    global _client
    if _client:
        _client.close()
        print("[-] MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    """
    Dependency injection function to get database instance
    
    Returns:
        AsyncIOMotorDatabase: MongoDB database instance
    """
    if _db is None:
        raise RuntimeError("MongoDB not connected. Call connect_to_mongo() first.")
    return _db
