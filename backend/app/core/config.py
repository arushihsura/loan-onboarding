"""
Centralized configuration management for FastAPI application
"""

import os
from typing import Optional

class Settings:
    """Application settings loaded from environment variables"""
    
    # Database
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "loan_video")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = ENVIRONMENT == "development"
    
    # API
    API_TITLE: str = "Loan Video KYC Platform"
    API_VERSION: str = "1.0.0"
    API_HOST: str = os.getenv("API_HOST", "127.0.0.1")
    API_PORT: int = int(os.getenv("API_PORT", "8001"))
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3003",
        "http://localhost:3005",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3004",
    ]
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO" if DEBUG else "WARNING")
    
    # Security (implement later)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # KYC Configuration
    TOTAL_KYC_STEPS: int = 5
    FACE_CONFIDENCE_THRESHOLD: float = 0.7
    FRAUD_SCORE_THRESHOLD: float = 0.3
    
    # Risk Scoring
    RISK_APPROVED_THRESHOLD: float = 70.0
    RISK_REVIEW_THRESHOLD: float = 85.0
    
    # Loan Configuration
    DEFAULT_INTEREST_RATE: float = 10.5
    DEFAULT_TENURE_MONTHS: int = 36
    MIN_MONTHLY_INCOME: float = 15000.0
    MIN_MONTHLY_BUFFER: float = 10000.0


# Global settings instance
settings = Settings()
