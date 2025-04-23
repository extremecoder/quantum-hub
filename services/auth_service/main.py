from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field, EmailStr
import os
from typing import Optional, List, Any, Dict
import json
import logging
import uuid
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Load environment variables
load_dotenv()

# Custom JSON encoder for UUID
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, uuid.UUID):
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

# Set up database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://quantum_user:quantum_password@postgres:5432/quantum_hub")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define SQLAlchemy models
class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_provider = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class User(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
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
            uuid.UUID: lambda v: str(v)
        }

class UserInDB(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
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

async def create_user(user: UserCreate, db: Session = Depends(get_db)) -> User:
    """
    Create a new user in the database
    """
    # Check if user already exists
    existing_user = db.query(UserModel).filter(UserModel.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )

    # Create user object with hashed password
    hashed_password = get_password_hash(user.password)
    
    user_in_db = UserModel(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
    )
    
    # Store user in database
    db.add(user_in_db)
    db.commit()
    db.refresh(user_in_db)
    
    # Return user without password
    return User(
        id=user_in_db.id,
        username=user_in_db.username,
        email=user_in_db.email,
        full_name=user_in_db.full_name,
        created_at=user_in_db.created_at,
        updated_at=user_in_db.updated_at
    )

async def get_user(username: str, db: Session = Depends(get_db)) -> Optional[UserInDB]:
    """
    Get a user from the database by username
    """
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if user:
        return UserInDB(
            id=user.id,
            username=user.username,
            email=user.email,
            hashed_password=user.hashed_password,
            full_name=user.full_name,
            is_active=user.is_active,
            is_provider=user.is_provider,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    return None

async def authenticate_user(username: str, password: str, db: Session = Depends(get_db)):
    user = await get_user(username, db)
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

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    user = await get_user(username=token_data.username, db=db)
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
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return await create_user(user, db)

@app.post("/token", response_model=dict)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = await authenticate_user(form_data.username, form_data.password, db)
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
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name
        }
    }

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

@app.get("/auth/google/callback")
async def google_auth_callback(code: str, db: Session = Depends(get_db)):
    """
    Handle the Google OAuth callback
    In a real implementation, this would exchange the authorization code for tokens
    """
    # This is a simplified demo version that would simulate a successful auth
    # In production, you would exchange the code for tokens using Google's API
    
    # Create a demo user for Google authentication
    user_id = str(uuid.uuid4())
    username = f"google_user_{datetime.utcnow().timestamp()}"
    email = "google_user@example.com"
    hashed_password = get_password_hash("demo_password")  # Not used for OAuth
    
    # Store in our database
    existing_user = db.query(UserModel).filter(UserModel.email == email).first()
    
    if not existing_user:
        user_in_db = UserModel(
            id=user_id,
            username=username,
            email=email,
            hashed_password=hashed_password,
            full_name="Google Demo User",
        )
        db.add(user_in_db)
        db.commit()
        db.refresh(user_in_db)
    else:
        user_id = existing_user.id
        username = existing_user.username
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username}, expires_delta=access_token_expires
    )
    
    # Return token and user info
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": username,
            "email": email,
            "full_name": "Google Demo User"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/api-keys", response_model=dict)
async def create_api_key(
    key_data: dict, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new API key for the current user.
    """
    # TODO: Implement proper API key generation with PostgreSQL
    api_key = str(uuid.uuid4())
    
    return {
        "id": str(uuid.uuid4()),
        "key": api_key,
        "name": key_data.get("name", "Default API Key"),
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=365),
        "is_active": True
    }

@app.get("/api-keys", response_model=List[dict])
async def get_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all API keys for the current user.
    """
    # TODO: Implement proper API key retrieval with PostgreSQL
    return []

@app.get("/api-keys/{key_id}", response_model=dict)
async def get_api_key(
    key_id: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific API key by ID.
    """
    # TODO: Implement proper API key retrieval with PostgreSQL
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="API key not found"
    )

@app.delete("/api-keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Revoke (disable) an API key.
    """
    # TODO: Implement proper API key revocation with PostgreSQL
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="API key not found"
    )

@app.get("/api-keys/usage/stats", response_model=dict)
async def get_api_usage_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get API usage statistics for the current user.
    """
    # TODO: Implement proper API usage statistics with PostgreSQL
    return {
        "total_requests": 0,
        "total_tokens": 0,
        "last_request": None
    }

# Initialize sample data for development
@app.on_event("startup")
async def startup_event():
    """
    Initialize the API on startup.
    """
    # Create sample users if none exist
    db = next(get_db())
    if not db.query(UserModel).first():
        demo_user = UserCreate(
            username="demo_user",
            email="demo@example.com",
            password="demo_password",
            full_name="Demo User"
        )
        await create_user(demo_user, db)