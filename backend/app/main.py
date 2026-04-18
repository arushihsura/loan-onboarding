"""
Loan Video KYC Platform - FastAPI Application Entry Point

This is the main application file that initializes FastAPI, sets up middleware,
registers API routes, and manages database lifecycle.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.mongo import connect_to_mongo, close_mongo

# TODO: Import route modules (will create these next)
# from app.api import auth, loans, onboarding, users, admin

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Enterprise loan application platform with KYC video verification"
)

# [*] CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# [*] MongoDB Lifecycle Events

@app.on_event("startup")
async def startup_event():
    """Initialize database connections and services on application startup"""
    await connect_to_mongo()
    print(f"[+] Application started in {settings.ENVIRONMENT} mode")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections and cleanup on application shutdown"""
    await close_mongo()
    print("[-] Application shutdown complete")


# [*] Health Check Endpoint

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Loan Video KYC Platform",
        "environment": settings.ENVIRONMENT
    }


# [*] API Route Registration

# TODO: Include routers from modularized API modules
# app.include_router(auth.router, prefix="/api", tags=["auth"])
# app.include_router(users.router, prefix="/api", tags=["users"])
# app.include_router(loans.router, prefix="/api", tags=["loans"])
# app.include_router(onboarding.router, prefix="/api", tags=["onboarding"])
# app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# [*] Temporary: Import from old modules for backward compatibility
from database import connect_to_mongo as old_connect, close_mongo as old_close, get_db
from api_routes import (
    SignupRequest, LoginRequest, EligibilityRequest, OfferAcceptRequest,
    SessionInitRequest, SubmitAnswerRequest, SessionCompleteRequest,
    signup_user, login_user, get_user_profile, update_user_status,
    check_eligibility, generate_offer, accept_offer,
    create_verification_record, complete_verification, get_application_timeline,
    init_video_session, get_current_step, submit_answer, complete_video_session
)
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import json

# Initialize AI risk model
AI_RISK_MODEL = RandomForestClassifier(n_estimators=100, random_state=42)

# Dummy training data
DUMMY_DATA = np.array([
    [0.8, 0.1], [0.75, 0.2], [0.85, 0.05], [0.9, 0.0], [0.7, 0.3],
    [0.6, 0.5], [0.5, 0.7], [0.4, 0.8], [0.3, 0.9], [0.2, 1.0]
])
DUMMY_LABELS = np.array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1])
AI_RISK_MODEL.fit(DUMMY_DATA, DUMMY_LABELS)

# Temporary routes (for backward compatibility)
@app.post("/api/signup")
async def signup(request: SignupRequest, db=get_db()):
    return await signup_user(request, db)

@app.post("/api/login")
async def login(request: LoginRequest, db=get_db()):
    return await login_user(request, db)

@app.get("/api/user/{phone}")
async def get_profile(phone: str, db=get_db()):
    return await get_user_profile(phone, db)

@app.put("/api/user/{phone}/status")
async def update_status(phone: str, request: dict, db=get_db()):
    return await update_user_status(phone, request.get("status_type"), request.get("status_value"), db)

@app.post("/api/check-eligibility")
async def check_eligibility_route(request: EligibilityRequest, db=get_db()):
    return await check_eligibility(request, db)

@app.post("/api/generate-offer")
async def generate_offer_route(request: dict, db=get_db()):
    return await generate_offer(request.get("phone"), request.get("principal"), db)

@app.post("/api/accept-offer")
async def accept_offer_route(request: OfferAcceptRequest, db=get_db()):
    return await accept_offer(request, db)

@app.post("/api/create-verification")
async def create_verification(request: dict, db=get_db()):
    return await create_verification_record(request.get("phone"), request.get("video_path"), db)

@app.post("/api/complete-verification")
async def complete_verification_route(request: dict, db=get_db()):
    return await complete_verification(request.get("phone"), request, db)

@app.get("/api/application-timeline/{phone}")
async def get_timeline(phone: str, db=get_db()):
    return await get_application_timeline(phone, db)

# KYC Session endpoints (NEW)
@app.post("/api/session/init")
async def init_session(request: SessionInitRequest, db=get_db()):
    return await init_video_session(request, db)

@app.get("/api/session/{session_id}/step")
async def get_step(session_id: str, db=get_db()):
    return await get_current_step(session_id, db)

@app.post("/api/session/submit-answer")
async def submit_session_answer(request: SubmitAnswerRequest, db=get_db()):
    return await submit_answer(request, db)

@app.post("/api/session/complete")
async def complete_session(request: SessionCompleteRequest, db=get_db()):
    return await complete_video_session(request, db)
