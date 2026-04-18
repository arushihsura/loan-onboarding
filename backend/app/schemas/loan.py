"""
Pydantic schemas for loan-related requests and responses
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Request schemas
class CheckEligibilityRequest(BaseModel):
    """Schema for eligibility check request"""
    phone: str
    monthly_income: float
    employment_type: str
    existing_emi: float = 0
    city: str
    loan_amount_needed: float


class GenerateOfferRequest(BaseModel):
    """Schema for loan offer generation request"""
    phone: str
    principal: float


class AcceptOfferRequest(BaseModel):
    """Schema for accepting a loan offer"""
    phone: str
    offer_id: str


# Response schemas
class EligibilityResponse(BaseModel):
    """Schema for eligibility check response"""
    eligible: bool
    eligible_amount: Optional[float]
    message: str
    application_id: Optional[str]


class LoanOfferResponse(BaseModel):
    """Schema for loan offer response"""
    offer_id: str
    principal: float
    interest_rate: float
    tenure_months: int
    emi: float
    status: str
    created_at: datetime


class ApplicationTimelineResponse(BaseModel):
    """Schema for application timeline/journey response"""
    phone: str
    steps: dict = Field(
        default_factory=lambda: {
            "account_created": {"completed": False, "timestamp": None},
            "eligibility_check": {"completed": False, "timestamp": None},
            "kyc_verification": {"completed": False, "timestamp": None},
            "risk_assessment": {"completed": False, "timestamp": None},
            "offer_generated": {"completed": False, "timestamp": None},
            "disbursement": {"completed": False, "timestamp": None},
        }
    )
