from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
from models import (
    User, LoanApplication, LoanOffer, VideoVerification,
    UserResponse, LoanApplicationResponse, LoanOfferResponse, VideoVerificationResponse
)
from pydantic import BaseModel
from typing import Optional, List
import json
import uuid

# [*] Request Models

class SignupRequest(BaseModel):
    phone: str
    email: str
    name: str


class LoginRequest(BaseModel):
    phone: str
    otp: str


class EligibilityRequest(BaseModel):
    phone: str
    monthly_income: float
    employment_type: str
    existing_emi: float
    city: str
    loan_amount_needed: float


class OfferAcceptRequest(BaseModel):
    phone: str
    offer_id: str


# [*] Video Session Models

class SessionInitRequest(BaseModel):
    phone: str
    name: str


class SubmitAnswerRequest(BaseModel):
    phone: str
    session_id: str
    step: int
    answer: str
    transcript: Optional[str] = None


class SessionCompleteRequest(BaseModel):
    phone: str
    session_id: str
    face_confidence: float
    fraud_score: float
    transcript: str


# [*] User Endpoints

async def signup_user(request: SignupRequest, db: AsyncIOMotorDatabase) -> dict:
    """Create new user account"""
    # Check if user exists
    existing = await db.users.find_one({"phone": request.phone})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    user_data = User(
        phone=request.phone,
        email=request.email,
        name=request.name,
        credit_score=750,
        pre_approved_limit=300000
    )
    
    result = await db.users.insert_one(user_data.dict())
    user_data.id = str(result.inserted_id)
    
    return {"ok": True, "user": user_data.dict()}


async def login_user(request: LoginRequest, db: AsyncIOMotorDatabase) -> dict:
    """Authenticate user with phone + OTP"""
    user = await db.users.find_one({"phone": request.phone})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # [TODO] Verify OTP in production
    # For now, any OTP works (demo mode)
    user["id"] = str(user["_id"])
    return {"ok": True, "user": user}


async def get_user_profile(phone: str, db: AsyncIOMotorDatabase) -> dict:
    """Get user profile by phone"""
    user = await db.users.find_one({"phone": phone})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["id"] = str(user["_id"])
    return user


async def update_user_status(phone: str, status_type: str, status_value: str, db: AsyncIOMotorDatabase) -> dict:
    """Update user status (kyc_status, verification_status, offer_status)"""
    update_field = {
        "kyc": "kyc_status",
        "verification": "verification_status",
        "offer": "offer_status"
    }.get(status_type)
    
    if not update_field:
        raise HTTPException(status_code=400, detail="Invalid status type")
    
    result = await db.users.update_one(
        {"phone": phone},
        {
            "$set": {
                update_field: status_value,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.users.find_one({"phone": phone})
    user["id"] = str(user["_id"])
    return user


# [*] Eligibility Endpoints

async def check_eligibility(request: EligibilityRequest, db: AsyncIOMotorDatabase) -> dict:
    """Check loan eligibility and update user journey"""
    income = request.monthly_income
    emi = request.existing_emi
    loan_needed = request.loan_amount_needed
    
    # Eligibility logic
    if income < 15000:
        eligible = False
        reason = "Minimum ₹15,000 monthly income required"
        eligible_amount = 0
    elif income - emi < 10000:
        eligible = False
        reason = "Existing EMI too high. Please clear some debt first"
        eligible_amount = 0
    else:
        eligible = True
        reason = None
        eligible_amount = min(loan_needed, income * 12)
    
    # Save to database
    app_data = LoanApplication(
        phone=request.phone,
        monthly_income=income,
        employment_type=request.employment_type,
        existing_emi=emi,
        city=request.city,
        loan_amount_needed=loan_needed,
        eligible=eligible,
        eligible_amount=eligible_amount if eligible else 0,
        rejection_reason=reason
    )
    
    result = await db.loan_applications.insert_one(app_data.dict())
    
    # [*] Update user eligibility status to mark this step as completed
    await db.users.update_one(
        {"phone": request.phone},
        {
            "$set": {
                "eligibility_status": "completed",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "ok": True,
        "eligible": eligible,
        "eligible_amount": eligible_amount,
        "message": "Pre-approved!" if eligible else reason,
        "application_id": str(result.inserted_id)
    }


# [*] Loan Offer Endpoints

async def generate_offer(phone: str, principal: float, db: AsyncIOMotorDatabase) -> dict:
    """Generate personalized loan offer"""
    user = await db.users.find_one({"phone": phone})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate EMI: P × (R × (1+R)^N) / ((1+R)^N - 1)
    interest_rate = 10.5  # 10.5% annual
    tenure_months = 36
    monthly_rate = interest_rate / 100 / 12
    
    numerator = principal * (monthly_rate * (1 + monthly_rate) ** tenure_months)
    denominator = ((1 + monthly_rate) ** tenure_months) - 1
    emi = numerator / denominator
    
    offer_data = LoanOffer(
        user_id=str(user["_id"]),
        phone=phone,
        principal=principal,
        interest_rate=interest_rate,
        tenure_months=tenure_months,
        emi=emi,
        status="pending"
    )
    
    result = await db.loan_offers.insert_one(offer_data.dict())
    
    return {
        "ok": True,
        "offer_id": str(result.inserted_id),
        "principal": principal,
        "interest_rate": interest_rate,
        "tenure_months": tenure_months,
        "emi": round(emi, 2)
    }


async def accept_offer(request: OfferAcceptRequest, db: AsyncIOMotorDatabase) -> dict:
    """Accept loan offer"""
    try:
        offer_id = ObjectId(request.offer_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid offer ID")
    
    offer = await db.loan_offers.find_one({"_id": offer_id})
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    # Update offer status
    await db.loan_offers.update_one(
        {"_id": offer_id},
        {
            "$set": {
                "status": "accepted",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Update user status
    await db.users.update_one(
        {"phone": request.phone},
        {
            "$set": {
                "offer_status": "accepted",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"ok": True, "message": "Offer accepted successfully"}


# [*] Video Verification Endpoints

async def create_verification_record(phone: str, video_path: str, db: AsyncIOMotorDatabase) -> dict:
    """Create video verification record"""
    user = await db.users.find_one({"phone": phone})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    verification_data = VideoVerification(
        user_id=str(user["_id"]),
        phone=phone,
        video_path=video_path,
        status="pending"
    )
    
    result = await db.video_verifications.insert_one(verification_data.dict())
    
    return {"ok": True, "verification_id": str(result.inserted_id)}


async def complete_verification(phone: str, face_detected: bool, voice_detected: bool, consent_given: bool, db: AsyncIOMotorDatabase) -> dict:
    """Mark verification as complete"""
    verification = await db.video_verifications.find_one(
        {"phone": phone},
        sort=[("created_at", -1)]
    )
    
    if not verification:
        raise HTTPException(status_code=404, detail="Verification record not found")
    
    is_complete = face_detected and voice_detected and consent_given
    status = "completed" if is_complete else "failed"
    liveness_score = 0.95 if is_complete else 0.0
    
    # Update verification record
    await db.video_verifications.update_one(
        {"_id": verification["_id"]},
        {
            "$set": {
                "face_detected": face_detected,
                "voice_detected": voice_detected,
                "consent_given": consent_given,
                "status": status,
                "liveness_score": liveness_score,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Update user KYC status
    await db.users.update_one(
        {"phone": phone},
        {
            "$set": {
                "kyc_status": "completed" if is_complete else "pending",
                "verification_status": "completed" if is_complete else "pending",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"ok": True, "status": status}


# [*] Application Status Endpoints

async def get_application_timeline(phone: str, db: AsyncIOMotorDatabase) -> dict:
    """Get application timeline/status showing all steps completed by user"""
    user = await db.users.find_one({"phone": phone})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "ok": True,
        "user": {
            "id": str(user["_id"]),
            "phone": user["phone"],
            "name": user["name"],
            "eligibility_status": user.get("eligibility_status", "pending"),
            "kyc_status": user.get("kyc_status", "pending"),
            "verification_status": user.get("verification_status", "pending"),
            "offer_status": user.get("offer_status", "pending")
        },
        "timeline": [
            {"step": "Account Created", "status": "completed", "date": user["created_at"].isoformat()},
            {"step": "Eligibility Check", "status": user.get("eligibility_status", "pending"), "date": None},
            {"step": "KYC Verification", "status": user.get("kyc_status", "pending"), "date": None},
            {"step": "Risk Assessment", "status": user.get("verification_status", "pending"), "date": None},
            {"step": "Offer Generated", "status": user.get("offer_status", "pending"), "date": None},
            {"step": "Disbursement", "status": "pending" if user.get("offer_status", "pending") == "pending" else "in-progress", "date": None}
        ]
    }


# [*] Video Session Management - Production KYC Flow

# Sequential KYC steps
KYC_STEPS = [
    {"step": 1, "prompt": "Please state your full name.", "field": "name", "type": "identity"},
    {"step": 2, "prompt": "Please look directly at the camera and blink twice.", "field": "liveness", "type": "liveness"},
    {"step": 3, "prompt": "Please state your monthly income.", "field": "income", "type": "income"},
    {"step": 4, "prompt": "What company do you work for?", "field": "employer", "type": "employment"},
    {"step": 5, "prompt": "Do you authorize us to process your loan application?", "field": "consent", "type": "consent"}
]


async def init_video_session(request: SessionInitRequest, db: AsyncIOMotorDatabase) -> dict:
    """Initialize a new video verification session"""
    user = await db.users.find_one({"phone": request.phone})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create session record
    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "phone": request.phone,
        "user_id": str(user["_id"]),
        "started_at": datetime.utcnow(),
        "status": "active",
        "current_step": 1,
        "answers": {},
        "transcript": "",
        "face_confidence": 0.0,
        "fraud_score": 0.0
    }
    
    await db.verification_sessions.insert_one(session_data)
    
    return {
        "ok": True,
        "session_id": session_id,
        "current_step": 1,
        "prompt": KYC_STEPS[0]["prompt"],
        "total_steps": len(KYC_STEPS)
    }


async def get_current_step(session_id: str, db: AsyncIOMotorDatabase) -> dict:
    """Get current step and prompt for the session"""
    session = await db.verification_sessions.find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    current_step = session.get("current_step", 1)
    step_data = KYC_STEPS[current_step - 1]
    
    return {
        "ok": True,
        "current_step": current_step,
        "prompt": step_data["prompt"],
        "total_steps": len(KYC_STEPS),
        "progress": f"{current_step}/{len(KYC_STEPS)}"
    }


async def submit_answer(request: SubmitAnswerRequest, db: AsyncIOMotorDatabase) -> dict:
    """Submit answer for current KYC step"""
    session = await db.verification_sessions.find_one({"session_id": request.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    current_step = request.step
    if current_step > len(KYC_STEPS):
        raise HTTPException(status_code=400, detail="Invalid step")
    
    # Store answer
    answers = session.get("answers", {})
    field_name = KYC_STEPS[current_step - 1]["field"]
    answers[field_name] = request.answer
    
    # Append to transcript
    transcript = session.get("transcript", "") + f"\nStep {current_step}: {request.transcript or request.answer}"
    
    # Move to next step
    next_step = current_step + 1
    is_complete = next_step > len(KYC_STEPS)
    
    # Update session
    await db.verification_sessions.update_one(
        {"session_id": request.session_id},
        {
            "$set": {
                "current_step": next_step,
                "answers": answers,
                "transcript": transcript,
                "status": "completed" if is_complete else "active"
            }
        }
    )
    
    if is_complete:
        return {
            "ok": True,
            "status": "completed",
            "message": "All steps completed. Processing verification...",
            "session_complete": True
        }
    
    next_step_data = KYC_STEPS[next_step - 1]
    return {
        "ok": True,
        "status": "next_step",
        "current_step": next_step,
        "prompt": next_step_data["prompt"],
        "progress": f"{next_step}/{len(KYC_STEPS)}"
    }


async def complete_video_session(request: SessionCompleteRequest, db: AsyncIOMotorDatabase) -> dict:
    """Complete video session, process verification, and make offer decision"""
    session = await db.verification_sessions.find_one({"session_id": request.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Update session with final data
    await db.verification_sessions.update_one(
        {"session_id": request.session_id},
        {
            "$set": {
                "face_confidence": request.face_confidence,
                "fraud_score": request.fraud_score,
                "transcript": request.transcript,
                "completed_at": datetime.utcnow(),
                "status": "completed"
            }
        }
    )
    
    # Risk scoring logic
    risk_score = 50 + request.fraud_score - (request.face_confidence * 20)
    risk_score = max(0, min(100, risk_score))  # Clamp 0-100
    
    decision = "approved" if risk_score < 70 else ("review" if risk_score < 85 else "rejected")
    
    # Get user and application data
    user = await db.users.find_one({"phone": request.phone})
    app = await db.loan_applications.find_one({"phone": request.phone}, sort=[("created_at", -1)])
    
    if not user or not app:
        raise HTTPException(status_code=404, detail="User or application not found")
    
    # Update user verification status
    await db.users.update_one(
        {"phone": request.phone},
        {
            "$set": {
                "kyc_status": "completed",
                "verification_status": decision,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Auto-generate offer if approved
    offer_id = None
    if decision == "approved" and app.get("eligible"):
        principal = app["eligible_amount"]
        interest_rate = 10.5
        tenure_months = 36
        monthly_rate = interest_rate / 100 / 12
        numerator = principal * (monthly_rate * (1 + monthly_rate) ** tenure_months)
        denominator = ((1 + monthly_rate) ** tenure_months) - 1
        emi = numerator / denominator
        
        offer_data = LoanOffer(
            user_id=str(user["_id"]),
            phone=request.phone,
            principal=principal,
            interest_rate=interest_rate,
            tenure_months=tenure_months,
            emi=emi,
            status="pending"
        )
        result = await db.loan_offers.insert_one(offer_data.dict())
        offer_id = str(result.inserted_id)
        
        await db.users.update_one(
            {"phone": request.phone},
            {"$set": {"offer_status": "generated"}}
        )
    
    return {
        "ok": True,
        "risk_score": round(risk_score, 2),
        "decision": decision,
        "message": {
            "approved": f"✓ Verified! You're eligible for ₹{app['eligible_amount']:,.0f}",
            "review": "Your application is under manual review.",
            "rejected": "Verification failed. Please try again."
        }.get(decision),
        "offer_id": offer_id,
        "next_action": {
            "approved": "view_offer",
            "review": "wait",
            "rejected": "retry"
        }.get(decision)
    }
