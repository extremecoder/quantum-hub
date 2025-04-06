from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from bson import ObjectId
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field, EmailStr
import os
from typing import Optional, List, Any, Dict
import json
import logging
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Custom JSON encoder for ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

app = FastAPI(json_encoder=JSONEncoder)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "5b0c1d6c5fafa8d4224ede60d504bf91e7a8d245cd290d33de52c55d")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# In-memory user storage for demo purposes
users_db = {}

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

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def create_user(user: UserCreate) -> User:
    """
    Create a new user in the database
    """
    # Check if user already exists
    if user.username in users_db:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )

    # Create user object with hashed password
    user_id = str(ObjectId())
    hashed_password = get_password_hash(user.password)
    
    user_in_db = UserInDB(
        id=user_id,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Store user in memory
    users_db[user.username] = user_in_db.dict()
    
    # Return user without password
    return User(
        id=user_id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

async def get_user(username: str) -> Optional[UserInDB]:
    """
    Get a user from the database by username
    """
    user = users_db.get(username)
    if user:
        return UserInDB(**user)
    return None

async def authenticate_user(username: str, password: str):
    user = await get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.JWTError:
        raise credentials_exception
    user = await get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return User(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        is_provider=user.is_provider,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

@app.post("/register", response_model=User)
async def register_user(user: UserCreate):
    return await create_user(user)

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    # Convert user to User model (without hashed password)
    user_data = User(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        is_provider=user.is_provider,
        created_at=user.created_at,
        updated_at=user.updated_at
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/auth/google/url")
async def get_google_auth_url():
    """Get the Google OAuth URL for authentication"""
    # Ideally this would be configured with real credentials
    client_id = os.getenv("GOOGLE_CLIENT_ID", "demo-client-id")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/auth/callback/google")
    scope = "email profile"
    
    # Construct the authorization URL
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope={scope}&access_type=offline"
    
    return {"url": auth_url}

@app.post("/auth/google/callback")
async def google_auth_callback(code: str):
    """
    Handle the Google OAuth callback
    In a real implementation, this would exchange the authorization code for tokens
    """
    # This is a simplified demo version that would simulate a successful auth
    # In production, you would exchange the code for tokens using Google's API
    
    # Create a demo user for Google authentication
    google_user = {
        "id": str(ObjectId()),
        "username": f"google_user_{datetime.utcnow().timestamp()}",
        "email": "google_user@example.com",
        "hashed_password": get_password_hash("demo_password"),  # Not used for OAuth
        "full_name": "Google Demo User",
        "is_active": True,
        "is_provider": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Store in our in-memory database
    users_db[google_user["username"]] = google_user
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": google_user["username"]}, expires_delta=access_token_expires
    )
    
    # Return token and user info
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": google_user["id"],
            "username": google_user["username"],
            "email": google_user["email"],
            "full_name": google_user["full_name"]
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}