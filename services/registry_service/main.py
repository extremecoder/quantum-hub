from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import jwt
import json
from services.auth_service.main import get_current_user
import logging
from fastapi import UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB setup
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_USERNAME = os.getenv("MONGO_USERNAME", "admin")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "password")
MONGO_DB = os.getenv("MONGO_DB", "quantum_hub")
MONGO_TEST_DB = os.getenv("MONGO_TEST_DB", "quantum_hub_test")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Check if we're in test mode
TESTING = os.getenv("TESTING", "false").lower() == "true"

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

app = FastAPI(json_encoder=JSONEncoder)

# MongoDB client
if TESTING:
    # Use admin credentials for authentication in test mode
    client = AsyncIOMotorClient(
        MONGO_URL,
        username=MONGO_USERNAME,
        password=MONGO_PASSWORD,
        authSource="admin"
    )
    db = client[MONGO_TEST_DB]
else:
    client = AsyncIOMotorClient(
        MONGO_URL,
        username=MONGO_USERNAME,
        password=MONGO_PASSWORD,
        authSource="admin"
    )
    db = client[MONGO_DB]
    
registry_collection = db["registry"]

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class RegistryItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    version: str
    tags: List[str] = []

class RegistryItemCreate(RegistryItemBase):
    pass

class RegistryItem(RegistryItemBase):
    id: Optional[str] = None
    provider_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }

class RegistryItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    tags: Optional[List[str]] = None

@app.post("/registry", response_model=RegistryItem)
async def create_registry_item(item: RegistryItemCreate, current_user: str = Depends(get_current_user)):
    item_dict = item.dict()
    item_dict["provider_id"] = current_user
    item_dict["created_at"] = datetime.utcnow()
    item_dict["updated_at"] = datetime.utcnow()
    
    result = await registry_collection.insert_one(item_dict)
    item_dict["id"] = str(result.inserted_id)
    return RegistryItem(**item_dict)

@app.get("/registry/{item_id}", response_model=RegistryItem)
async def get_registry_item(item_id: str, current_user: str = Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(item_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid registry item ID"
            )
        item = await registry_collection.find_one({"_id": ObjectId(item_id)})
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registry item not found"
            )
        item["id"] = str(item["_id"])
        return RegistryItem(**item)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.get("/registry", response_model=List[RegistryItem])
async def list_registry_items(provider_id: Optional[str] = None):
    items = []
    query = {"provider_id": provider_id} if provider_id else {}
    cursor = registry_collection.find(query)
    async for item in cursor:
        item["id"] = str(item["_id"])
        items.append(RegistryItem(**item))
    return items

@app.put("/registry/{item_id}", response_model=RegistryItem)
async def update_registry_item(item_id: str, item_update: RegistryItemUpdate, current_user: str = Depends(get_current_user)):
    try:
        item = await registry_collection.find_one({"_id": ObjectId(item_id)})
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registry item not found"
            )
        if item["provider_id"] != current_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        update_data = item_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await registry_collection.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": update_data}
        )
        
        updated_item = await registry_collection.find_one({"_id": ObjectId(item_id)})
        updated_item["id"] = str(updated_item["_id"])
        return RegistryItem(**updated_item)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.delete("/registry/{item_id}")
async def delete_registry_item(item_id: str, current_user: str = Depends(get_current_user)):
    try:
        item = await registry_collection.find_one({"_id": ObjectId(item_id)})
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registry item not found"
            )
        if item["provider_id"] != current_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        await registry_collection.delete_one({"_id": ObjectId(item_id)})
        return {"message": "Registry item deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.get("/registry/search", response_model=List[RegistryItem])
async def search_registry_items(q: str):
    items = []
    query = {
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}}
        ]
    }
    cursor = registry_collection.find(query)
    async for item in cursor:
        item["id"] = str(item["_id"])
        items.append(RegistryItem(**item))
    return items

@app.get("/registry/{name}/versions", response_model=List[RegistryItem])
async def get_registry_item_versions(name: str):
    items = []
    cursor = registry_collection.find({"name": name})
    async for item in cursor:
        item["id"] = str(item["_id"])
        items.append(RegistryItem(**item))
    return items