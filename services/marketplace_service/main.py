from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, conint
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
    
offerings_collection = db["offerings"]

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

class Rating(BaseModel):
    user_id: str
    rating: float
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }

class OfferingBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    status: str = "active"

class OfferingCreate(OfferingBase):
    pass

class Offering(OfferingBase):
    id: Optional[str] = None
    provider_id: str
    created_at: datetime
    updated_at: datetime
    ratings: List[Rating] = []

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }

class OfferingUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None

@app.post("/offerings", response_model=Offering)
async def create_offering(offering: OfferingCreate, current_user: str = Depends(get_current_user)):
    offering_dict = offering.dict()
    offering_dict["provider_id"] = current_user
    offering_dict["ratings"] = []
    offering_dict["created_at"] = datetime.utcnow()
    offering_dict["updated_at"] = datetime.utcnow()
    
    result = await offerings_collection.insert_one(offering_dict)
    offering_dict["id"] = str(result.inserted_id)
    return Offering(**offering_dict)

@app.get("/offerings/{offering_id}", response_model=Offering)
async def get_offering(offering_id: str, current_user: str = Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(offering_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid offering ID"
            )
        offering = await offerings_collection.find_one({"_id": ObjectId(offering_id)})
        if not offering:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offering not found"
            )
        offering["id"] = str(offering["_id"])
        return Offering(**offering)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.get("/offerings", response_model=List[Offering])
async def list_offerings(provider_id: Optional[str] = None):
    items = []
    query = {"provider_id": provider_id} if provider_id else {}
    cursor = offerings_collection.find(query)
    async for item in cursor:
        item["id"] = str(item["_id"])
        items.append(Offering(**item))
    return items

@app.put("/offerings/{offering_id}", response_model=Offering)
async def update_offering(offering_id: str, offering_update: OfferingUpdate, current_user: str = Depends(get_current_user)):
    try:
        offering = await offerings_collection.find_one({"_id": ObjectId(offering_id)})
        if not offering:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offering not found"
            )
        if offering["provider_id"] != current_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        update_data = offering_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await offerings_collection.update_one(
            {"_id": ObjectId(offering_id)},
            {"$set": update_data}
        )
        
        updated_offering = await offerings_collection.find_one({"_id": ObjectId(offering_id)})
        updated_offering["id"] = str(updated_offering["_id"])
        return Offering(**updated_offering)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.delete("/offerings/{offering_id}")
async def delete_offering(offering_id: str, current_user: str = Depends(get_current_user)):
    try:
        offering = await offerings_collection.find_one({"_id": ObjectId(offering_id)})
        if not offering:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offering not found"
            )
        if offering["provider_id"] != current_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        await offerings_collection.delete_one({"_id": ObjectId(offering_id)})
        return {"message": "Offering deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.post("/offerings/{offering_id}/subscribe")
async def subscribe_to_offering(offering_id: str, current_user: str = Depends(get_current_user)):
    try:
        offering = await offerings_collection.find_one({"_id": ObjectId(offering_id)})
        if not offering:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offering not found"
            )
        if offering["provider_id"] == current_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot subscribe to your own offering"
            )
        
        # Here you would typically handle payment and subscription logic
        return {"message": "Successfully subscribed to offering"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.post("/offerings/{offering_id}/rate")
async def rate_offering(
    offering_id: str,
    rating: float,
    comment: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    try:
        offering = await offerings_collection.find_one({"_id": ObjectId(offering_id)})
        if not offering:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offering not found"
            )
        
        new_rating = Rating(
            user_id=current_user,
            rating=rating,
            comment=comment,
            created_at=datetime.utcnow()
        )
        
        await offerings_collection.update_one(
            {"_id": ObjectId(offering_id)},
            {
                "$push": {"ratings": new_rating.dict()},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return {"message": "Rating added successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.get("/offerings/search", response_model=List[Offering])
async def search_offerings(q: str):
    items = []
    query = {
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]
    }
    cursor = offerings_collection.find(query)
    async for item in cursor:
        item["id"] = str(item["_id"])
        items.append(Offering(**item))
    return items