"""
Token repository for the Auth Service.

This module provides functions for token-related database operations.
"""
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from services.auth_service.app.models.database import RefreshToken, PasswordReset, EmailVerification
from services.shared.utils.api_key import generate_token


async def create_refresh_token(
    db: AsyncSession,
    user_id: UUID,
    expires_minutes: int = 60 * 24 * 7  # 1 week
) -> RefreshToken:
    """
    Create a new refresh token.
    
    Args:
        db: Database session.
        user_id: User ID.
        expires_minutes: Number of minutes until expiry.
        
    Returns:
        RefreshToken: Created refresh token.
    """
    # Generate token
    token = generate_token()
    
    # Calculate expiry date
    expires_at = datetime.utcnow() + timedelta(minutes=expires_minutes)
    
    # Create refresh token
    refresh_token = RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    
    # Add to database
    db.add(refresh_token)
    await db.commit()
    await db.refresh(refresh_token)
    
    return refresh_token


async def get_refresh_token(db: AsyncSession, token: str) -> Optional[RefreshToken]:
    """
    Get a refresh token.
    
    Args:
        db: Database session.
        token: Refresh token.
        
    Returns:
        Optional[RefreshToken]: Refresh token if found, None otherwise.
    """
    result = await db.execute(select(RefreshToken).where(RefreshToken.token == token))
    return result.scalars().first()


async def revoke_refresh_token(db: AsyncSession, token: str) -> bool:
    """
    Revoke a refresh token.
    
    Args:
        db: Database session.
        token: Refresh token.
        
    Returns:
        bool: True if token was revoked, False otherwise.
    """
    result = await db.execute(
        update(RefreshToken)
        .where(RefreshToken.token == token)
        .values(is_revoked=True)
    )
    await db.commit()
    
    return result.rowcount > 0


async def is_refresh_token_valid(db: AsyncSession, token: str) -> bool:
    """
    Check if a refresh token is valid.
    
    Args:
        db: Database session.
        token: Refresh token.
        
    Returns:
        bool: True if token is valid, False otherwise.
    """
    refresh_token = await get_refresh_token(db, token)
    
    if not refresh_token:
        return False
    
    if refresh_token.is_revoked:
        return False
    
    if refresh_token.expires_at < datetime.utcnow():
        return False
    
    return True


async def create_password_reset_token(
    db: AsyncSession,
    user_id: UUID,
    expires_minutes: int = 60  # 1 hour
) -> PasswordReset:
    """
    Create a new password reset token.
    
    Args:
        db: Database session.
        user_id: User ID.
        expires_minutes: Number of minutes until expiry.
        
    Returns:
        PasswordReset: Created password reset token.
    """
    # Generate token
    token = generate_token()
    
    # Calculate expiry date
    expires_at = datetime.utcnow() + timedelta(minutes=expires_minutes)
    
    # Create password reset token
    password_reset = PasswordReset(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    
    # Add to database
    db.add(password_reset)
    await db.commit()
    await db.refresh(password_reset)
    
    return password_reset


async def get_password_reset_token(db: AsyncSession, token: str) -> Optional[PasswordReset]:
    """
    Get a password reset token.
    
    Args:
        db: Database session.
        token: Password reset token.
        
    Returns:
        Optional[PasswordReset]: Password reset token if found, None otherwise.
    """
    result = await db.execute(select(PasswordReset).where(PasswordReset.token == token))
    return result.scalars().first()


async def mark_password_reset_token_used(db: AsyncSession, token: str) -> bool:
    """
    Mark a password reset token as used.
    
    Args:
        db: Database session.
        token: Password reset token.
        
    Returns:
        bool: True if token was marked as used, False otherwise.
    """
    result = await db.execute(
        update(PasswordReset)
        .where(PasswordReset.token == token)
        .values(is_used=True)
    )
    await db.commit()
    
    return result.rowcount > 0


async def is_password_reset_token_valid(db: AsyncSession, token: str) -> bool:
    """
    Check if a password reset token is valid.
    
    Args:
        db: Database session.
        token: Password reset token.
        
    Returns:
        bool: True if token is valid, False otherwise.
    """
    password_reset = await get_password_reset_token(db, token)
    
    if not password_reset:
        return False
    
    if password_reset.is_used:
        return False
    
    if password_reset.expires_at < datetime.utcnow():
        return False
    
    return True


async def create_email_verification_token(
    db: AsyncSession,
    user_id: UUID,
    expires_minutes: int = 60 * 24  # 24 hours
) -> EmailVerification:
    """
    Create a new email verification token.
    
    Args:
        db: Database session.
        user_id: User ID.
        expires_minutes: Number of minutes until expiry.
        
    Returns:
        EmailVerification: Created email verification token.
    """
    # Generate token
    token = generate_token()
    
    # Calculate expiry date
    expires_at = datetime.utcnow() + timedelta(minutes=expires_minutes)
    
    # Create email verification token
    email_verification = EmailVerification(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    
    # Add to database
    db.add(email_verification)
    await db.commit()
    await db.refresh(email_verification)
    
    return email_verification


async def get_email_verification_token(db: AsyncSession, token: str) -> Optional[EmailVerification]:
    """
    Get an email verification token.
    
    Args:
        db: Database session.
        token: Email verification token.
        
    Returns:
        Optional[EmailVerification]: Email verification token if found, None otherwise.
    """
    result = await db.execute(select(EmailVerification).where(EmailVerification.token == token))
    return result.scalars().first()


async def mark_email_verification_token_used(db: AsyncSession, token: str) -> bool:
    """
    Mark an email verification token as used.
    
    Args:
        db: Database session.
        token: Email verification token.
        
    Returns:
        bool: True if token was marked as used, False otherwise.
    """
    result = await db.execute(
        update(EmailVerification)
        .where(EmailVerification.token == token)
        .values(is_used=True)
    )
    await db.commit()
    
    return result.rowcount > 0


async def is_email_verification_token_valid(db: AsyncSession, token: str) -> bool:
    """
    Check if an email verification token is valid.
    
    Args:
        db: Database session.
        token: Email verification token.
        
    Returns:
        bool: True if token is valid, False otherwise.
    """
    email_verification = await get_email_verification_token(db, token)
    
    if not email_verification:
        return False
    
    if email_verification.is_used:
        return False
    
    if email_verification.expires_at < datetime.utcnow():
        return False
    
    return True
