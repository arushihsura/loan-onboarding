"""
Video verification and KYC session MongoDB document models
"""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List


class VideoVerification(BaseModel):
    """MongoDB VideoVerification document model"""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    phone: str
    video_path: str
    face_detected: bool = False
    voice_detected: bool = False
    consent_given: bool = False
    liveness_score: Optional[float] = None
    status: str = "pending"  # pending, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class VerificationSession(BaseModel):
    """MongoDB VerificationSession document model for sequential KYC"""
    id: Optional[str] = Field(default=None, alias="_id")
    session_id: str  # Unique session identifier
    user_id: Optional[str] = None
    phone: str
    name: str
    current_step: int = 1
    total_steps: int = 5
    answers: dict = Field(default_factory=dict)  # Stores answers for each step
    face_confidence: Optional[float] = None
    fraud_score: Optional[float] = None
    risk_score: Optional[float] = None
    decision: Optional[str] = None  # approved, review, rejected
    transcript: Optional[str] = None
    status: str = "in_progress"  # in_progress, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class VideoVerificationResponse(BaseModel):
    """API response model for VideoVerification"""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    phone: str
    face_detected: bool
    voice_detected: bool
    consent_given: bool
    liveness_score: Optional[float]
    status: str
    created_at: datetime

    class Config:
        populate_by_name = True
