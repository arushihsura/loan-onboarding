from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId


# [*] MongoDB Document Models (Pydantic)

class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    phone: str
    email: Optional[str] = None
    name: str
    credit_score: int = 750
    pre_approved_limit: float = 300000
    eligibility_status: str = "pending"  # pending, completed
    kyc_status: str = "pending"  # pending, completed
    verification_status: str = "pending"  # pending, completed
    offer_status: str = "pending"  # pending, accepted, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class LoanApplication(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    phone: str
    monthly_income: float
    employment_type: str  # salaried, self-employed, business
    existing_emi: float = 0
    city: str
    loan_amount_needed: float
    eligible: bool
    eligible_amount: Optional[float] = None
    rejection_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class LoanOffer(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    phone: str
    principal: float
    interest_rate: float
    tenure_months: int
    emi: float
    status: str = "pending"  # pending, accepted, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class VideoVerification(BaseModel):
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


# [*] Response Models

class UserResponse(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    phone: str
    email: Optional[str]
    name: str
    credit_score: int
    pre_approved_limit: float
    kyc_status: str
    verification_status: str
    offer_status: str
    created_at: datetime

    class Config:
        populate_by_name = True


class LoanApplicationResponse(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    phone: str
    monthly_income: float
    employment_type: str
    existing_emi: float
    city: str
    loan_amount_needed: float
    eligible: bool
    eligible_amount: Optional[float]
    rejection_reason: Optional[str]
    created_at: datetime

    class Config:
        populate_by_name = True


class LoanOfferResponse(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    phone: str
    principal: float
    interest_rate: float
    tenure_months: int
    emi: float
    status: str
    created_at: datetime

    class Config:
        populate_by_name = True


class VideoVerificationResponse(BaseModel):
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
