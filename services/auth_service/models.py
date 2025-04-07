from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId
from datetime import datetime
from typing import Optional, List

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class User(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_provider: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: lambda v: str(v)
        }

class UserInDB(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    username: str
    email: EmailStr
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = True
    is_provider: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[User] = None

class TokenData(BaseModel):
    username: Optional[str] = None

class APIKeyCreate(BaseModel):
    name: str
    expires_at: Optional[datetime] = None

class APIKey(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    key: str
    name: str
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    is_active: bool = True
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: lambda v: str(v)
        }

class APIKeyResponse(BaseModel):
    id: str
    key: str  # This will be partially masked in responses except when first created
    name: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: lambda v: str(v)
        }

class APIUsageStats(BaseModel):
    total_requests: int
    total_requests_limit: int
    compute_time_hours: float
    compute_time_limit: float
