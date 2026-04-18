"""
Loan application and offer MongoDB document models
"""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class LoanApplication(BaseModel):
    """MongoDB LoanApplication document model"""
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
    """MongoDB LoanOffer document model"""
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


class LoanApplicationResponse(BaseModel):
    """API response model for LoanApplication"""
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
    """API response model for LoanOffer"""
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
