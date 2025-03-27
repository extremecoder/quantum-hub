from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
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
SECRET_KEY = os.getenv("SECRET_KEY", "test_secret_key")
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
    # Use without authentication for testing
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[MONGO_TEST_DB]
else:
    client = AsyncIOMotorClient(
        MONGO_URL,
        username=MONGO_USERNAME,
        password=MONGO_PASSWORD,
        authSource="admin"
    )
    db = client[MONGO_DB]
    
projects_collection = db["projects"]

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

class ProjectFile(BaseModel):
    filename: str
    content_type: str
    size: int
    created_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    tags: List[str] = []

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: Optional[str] = None
    owner_id: str
    created_at: datetime
    updated_at: datetime
    files: List[ProjectFile] = []

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

@app.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate, current_user: str = Depends(get_current_user)):
    project_dict = project.dict()
    project_dict["owner_id"] = current_user
    project_dict["created_at"] = datetime.utcnow()
    project_dict["updated_at"] = datetime.utcnow()
    
    result = await projects_collection.insert_one(project_dict)
    project_dict["id"] = str(result.inserted_id)
    return Project(**project_dict)

@app.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, current_user: str = Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(project_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid project ID"
            )
        project = await projects_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        if project["owner_id"] != current_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        project["id"] = str(project["_id"])
        return Project(**project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.get("/projects", response_model=List[Project])
async def list_projects(current_user: str = Depends(get_current_user)):
    projects = []
    cursor = projects_collection.find({"owner_id": current_user})
    async for project in cursor:
        project["id"] = str(project["_id"])
        projects.append(Project(**project))
    return projects

@app.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_update: ProjectUpdate, current_user: str = Depends(get_current_user)):
    try:
        project = await projects_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        if project["owner_id"] != current_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        update_data = project_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": update_data}
        )
        
        updated_project = await projects_collection.find_one({"_id": ObjectId(project_id)})
        updated_project["id"] = str(updated_project["_id"])
        return Project(**updated_project)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: str = Depends(get_current_user)):
    try:
        project = await projects_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        if project["owner_id"] != current_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        await projects_collection.delete_one({"_id": ObjectId(project_id)})
        return {"message": "Project deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.post("/projects/{project_id}/files")
async def upload_project_file(
    project_id: str,
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    try:
        project = await projects_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        if project["owner_id"] != current_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        content = await file.read()
        project_file = ProjectFile(
            filename=file.filename,
            content_type=file.content_type,
            size=len(content),
            created_at=datetime.utcnow()
        )
        
        await projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {
                "$push": {"files": project_file.dict()},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return {"message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )