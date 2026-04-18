"""
Pydantic schemas for user-related requests and responses
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Request schemas
class SignupRequest(BaseModel):
    """Schema for user signup request"""
    phone: str
    email: str
    name: str


class LoginRequest(BaseModel):
    """Schema for user login request"""
    phone: str
    otp: str


class UpdateUserStatusRequest(BaseModel):
    """Schema for updating user status"""
    status_type: str  # eligibility_status, kyc_status, verification_status, offer_status
    status_value: str


# Response schemas
class UserProfileResponse(BaseModel):
    """Schema for user profile response"""
    phone: str
    email: Optional[str]
    name: str
    credit_score: int
    pre_approved_limit: float
    eligibility_status: str
    kyc_status: str
    verification_status: str
    offer_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Schema for authentication response"""
    phone: str
    name: str
    email: Optional[str]
    token: Optional[str] = None
    message: str
