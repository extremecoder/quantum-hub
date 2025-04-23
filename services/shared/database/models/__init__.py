"""
Database models package for the Quantum Hub application.

This package contains all SQLAlchemy models representing database tables 
and their relationships, organized by domain.
"""

# Import all models for easy access from the models package
from .user import User, UserProfile, UserApiKey, UserSession
from .application import Project, QuantumApp, AppVersion
from .marketplace import MarketplaceListing, Subscription, SubscriptionKey
from .execution import Job, JobResult, Platform, Device

# Import to ensure models are registered with SQLAlchemy
__all__ = [
    # User models
    "User", 
    "UserProfile", 
    "UserApiKey", 
    "UserSession",
    
    # Application models
    "Project", 
    "QuantumApp", 
    "AppVersion",
    
    # Marketplace models
    "MarketplaceListing", 
    "Subscription", 
    "SubscriptionKey",
    
    # Execution models
    "Job", 
    "JobResult", 
    "Platform", 
    "Device",
]
