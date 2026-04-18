"""
Security utilities for authentication and authorization
"""

import os
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import secrets


def hash_password(password: str) -> str:
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(plain_password) == hashed_password


def generate_otp(length: int = 4) -> str:
    """Generate a random OTP"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])


def verify_otp(provided_otp: str, stored_otp: str, expires_at: datetime) -> bool:
    """Verify OTP and check if it's expired"""
    if datetime.utcnow() > expires_at:
        return False
    return provided_otp == stored_otp


def create_otp_record() -> dict:
    """Create a new OTP record with expiration"""
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    return {
        "otp": otp,
        "expires_at": expires_at,
        "attempts": 0,
        "max_attempts": 3
    }
