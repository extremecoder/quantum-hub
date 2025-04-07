"""
API Key management service for Quantum Hub.
"""
from datetime import datetime, timedelta
import secrets
import string
from typing import List, Optional
from bson import ObjectId

# Use direct imports to avoid circular dependency
from models import APIKey, APIKeyCreate, APIKeyResponse, APIUsageStats

# In-memory storage for API keys
api_keys_db = {}

# In-memory storage for API usage stats
api_usage_db = {}

def generate_api_key_string(prefix: str = "qh") -> str:
    """
    Generate a secure API key string.
    
    Args:
        prefix (str): The prefix to use for the API key.
        
    Returns:
        str: A secure random API key string.
    """
    # Generate a random string for the API key
    key_length = 32
    random_part = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(key_length))
    
    # Create the key with a prefix format similar to "qh_pk_randomstring"
    return f"{prefix}_{random_part}"

async def create_api_key(user_id: str, key_data: APIKeyCreate) -> APIKey:
    """
    Create a new API key for a user.
    
    Args:
        user_id (str): The ID of the user.
        key_data (APIKeyCreate): The API key data.
        
    Returns:
        APIKey: The created API key.
    """
    # Generate a new API key
    key_id = str(ObjectId())
    
    # Determine key prefix based on name
    key_prefix = "qh"
    if "prod" in key_data.name.lower() or "production" in key_data.name.lower():
        key_prefix = "qh_pk"
    elif "dev" in key_data.name.lower() or "development" in key_data.name.lower():
        key_prefix = "qh_dk"
    elif "test" in key_data.name.lower() or "trial" in key_data.name.lower():
        key_prefix = "qh_tk"
    
    api_key = APIKey(
        id=key_id,
        key=generate_api_key_string(key_prefix),
        name=key_data.name,
        user_id=user_id,
        created_at=datetime.utcnow(),
        expires_at=key_data.expires_at,
        is_active=True
    )
    
    # Store in in-memory database
    if user_id not in api_keys_db:
        api_keys_db[user_id] = []
    api_keys_db[user_id].append(api_key.dict())
    
    # Initialize usage stats for this key
    api_usage_db[api_key.key] = {
        "request_count": 0,
        "compute_time": 0.0,  # in hours
    }
    
    return api_key

async def get_api_keys(user_id: str) -> List[APIKeyResponse]:
    """
    Get all API keys for a user.
    
    Args:
        user_id (str): The ID of the user.
        
    Returns:
        List[APIKeyResponse]: A list of all API keys for the user.
    """
    if user_id not in api_keys_db:
        return []
    
    api_keys = []
    for key_data in api_keys_db[user_id]:
        key = APIKey(**key_data)
        
        # Mask the key except when it's newly created
        masked_key = f"{key.key[:8]}{'*' * 12}{key.key[-4:]}"
        
        api_keys.append(APIKeyResponse(
            id=key.id,
            key=masked_key,
            name=key.name,
            created_at=key.created_at,
            expires_at=key.expires_at,
            is_active=key.is_active
        ))
    
    return api_keys

async def get_api_key(user_id: str, key_id: str) -> Optional[APIKeyResponse]:
    """
    Get a specific API key for a user.
    
    Args:
        user_id (str): The ID of the user.
        key_id (str): The ID of the API key.
        
    Returns:
        Optional[APIKeyResponse]: The API key if found, None otherwise.
    """
    if user_id not in api_keys_db:
        return None
    
    for key_data in api_keys_db[user_id]:
        if key_data["id"] == key_id:
            key = APIKey(**key_data)
            
            # Mask the key except when it's newly created
            masked_key = f"{key.key[:8]}{'*' * 12}{key.key[-4:]}"
            
            return APIKeyResponse(
                id=key.id,
                key=masked_key,
                name=key.name,
                created_at=key.created_at,
                expires_at=key.expires_at,
                is_active=key.is_active
            )
    
    return None

async def revoke_api_key(user_id: str, key_id: str) -> bool:
    """
    Revoke an API key.
    
    Args:
        user_id (str): The ID of the user.
        key_id (str): The ID of the API key to revoke.
        
    Returns:
        bool: True if the key was revoked, False otherwise.
    """
    if user_id not in api_keys_db:
        return False
    
    for i, key_data in enumerate(api_keys_db[user_id]):
        if key_data["id"] == key_id:
            # Set the key to inactive
            api_keys_db[user_id][i]["is_active"] = False
            return True
    
    return False

async def validate_api_key(api_key: str) -> Optional[str]:
    """
    Validate an API key and return the user ID if it's valid.
    
    Args:
        api_key (str): The API key to validate.
        
    Returns:
        Optional[str]: The user ID if the key is valid, None otherwise.
    """
    for user_id, keys in api_keys_db.items():
        for key_data in keys:
            if key_data["key"] == api_key and key_data["is_active"]:
                # Check if expired
                if key_data["expires_at"] and datetime.utcnow() > key_data["expires_at"]:
                    return None
                
                # Count this request
                if api_key in api_usage_db:
                    api_usage_db[api_key]["request_count"] += 1
                
                return user_id
    
    return None

async def get_api_usage_stats(user_id: str) -> APIUsageStats:
    """
    Get API usage statistics for a user.
    
    Args:
        user_id (str): The ID of the user.
        
    Returns:
        APIUsageStats: The API usage statistics.
    """
    # In a real implementation, these would be retrieved from a database or analytics service
    
    # Default limits
    total_requests_limit = 50000
    compute_time_limit = 100  # hours
    
    # Count totals for this user
    total_requests = 0
    compute_time = 0.0
    
    if user_id in api_keys_db:
        for key_data in api_keys_db[user_id]:
            key = key_data["key"]
            if key in api_usage_db:
                total_requests += api_usage_db[key]["request_count"]
                compute_time += api_usage_db[key]["compute_time"]
    
    # For demo, make sure there's some usage to display
    if total_requests == 0:
        total_requests = 25421
    if compute_time == 0:
        compute_time = 28.5
    
    return APIUsageStats(
        total_requests=total_requests,
        total_requests_limit=total_requests_limit,
        compute_time_hours=compute_time,
        compute_time_limit=compute_time_limit
    )

# Sample data for development
def init_sample_data():
    """Initialize sample API keys for development."""
    # Create some sample data if none exists
    user_id = "sample_user"
    api_keys_db[user_id] = []
    
    # Production key
    prod_key = APIKey(
        id=str(ObjectId()),
        key="qh_pk_sampleproductionkey1234567890abcdefcRtG",
        name="Production Key",
        user_id=user_id,
        created_at=datetime.utcnow() - timedelta(days=90),
        expires_at=None,
        is_active=True
    )
    
    # Development key
    dev_key = APIKey(
        id=str(ObjectId()),
        key="qh_dk_sampledevelopmentkey1234567890abcdeftHj5",
        name="Development Key",
        user_id=user_id,
        created_at=datetime.utcnow() - timedelta(days=45),
        expires_at=datetime.utcnow() + timedelta(days=320),
        is_active=True
    )
    
    # Trial key (expired)
    trial_key = APIKey(
        id=str(ObjectId()),
        key="qh_tk_sampletrialkey1234567890abcdefghijzP4s",
        name="Trial Key",
        user_id=user_id,
        created_at=datetime.utcnow() - timedelta(days=30),
        expires_at=datetime.utcnow() - timedelta(days=1),
        is_active=True
    )
    
    api_keys_db[user_id] = [
        prod_key.dict(),
        dev_key.dict(),
        trial_key.dict()
    ]
    
    # Add some usage data
    api_usage_db[prod_key.key] = {
        "request_count": 15000,
        "compute_time": 18.5,
    }
    api_usage_db[dev_key.key] = {
        "request_count": 9500,
        "compute_time": 8.3,
    }
    api_usage_db[trial_key.key] = {
        "request_count": 921,
        "compute_time": 1.7,
    }
