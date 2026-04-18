"""
User MongoDB document model and response schemas
"""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class User(BaseModel):
    """MongoDB User document model"""
    id: Optional[str] = Field(default=None, alias="_id")
    phone: str
    email: Optional[str] = None
    name: str
    credit_score: int = 750
    pre_approved_limit: float = 300000
    eligibility_status: str = "pending"  # pending, completed
    kyc_status: str = "pending"  # pending, approved, review, rejected
    verification_status: str = "pending"  # pending, approved, review, rejected
    offer_status: str = "pending"  # pending, accepted, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class UserResponse(BaseModel):
    """API response model for User"""
    id: Optional[str] = Field(default=None, alias="_id")
    phone: str
    email: Optional[str]
    name: str
    credit_score: int
    pre_approved_limit: float
    kyc_status: str
    verification_status: str
    offer_status: str
    eligibility_status: str
    created_at: datetime

    class Config:
        populate_by_name = True
