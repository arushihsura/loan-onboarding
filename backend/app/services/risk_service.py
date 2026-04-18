"""
Risk scoring service for KYC verification
"""

from sklearn.ensemble import RandomForestClassifier
import numpy as np
from app.core.config import settings


# Initialize AI risk model at module level
AI_RISK_MODEL = RandomForestClassifier(n_estimators=100, random_state=42)

# Dummy training data for the model
DUMMY_DATA = np.array([
    [0.8, 0.1],  # High confidence, low fraud
    [0.75, 0.2],
    [0.85, 0.05],
    [0.9, 0.0],
    [0.7, 0.3],
    [0.6, 0.5],
    [0.5, 0.7],
    [0.4, 0.8],
    [0.3, 0.9],
    [0.2, 1.0]
])

DUMMY_LABELS = np.array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1])

# Train model with dummy data
AI_RISK_MODEL.fit(DUMMY_DATA, DUMMY_LABELS)


def calculate_risk_score(
    face_confidence: float,
    fraud_score: float,
    income_verification: bool = False,
    employment_verification: bool = False
) -> float:
    """
    Calculate composite risk score (0-100 scale)
    
    Args:
        face_confidence: Face detection confidence (0-1)
        fraud_score: Fraud detection score (0-1)
        income_verification: Whether income was verified
        employment_verification: Whether employment was verified
    
    Returns:
        Risk score (0-100), where lower is better
    """
    # Base formula: risk = 50 + fraud_score(0-50) - confidence(0-20) - verifications(0-10)
    base_score = 50
    fraud_component = fraud_score * 50  # 0-50
    confidence_component = face_confidence * 20  # 0-20 (higher confidence = lower risk)
    verification_bonus = (income_verification + employment_verification) * 5  # 0-10
    
    risk_score = base_score + fraud_component - confidence_component - verification_bonus
    
    # Clamp to 0-100 range
    risk_score = max(0, min(100, risk_score))
    
    return risk_score


def get_decision_from_risk_score(risk_score: float) -> str:
    """
    Determine KYC decision based on risk score
    
    Args:
        risk_score: Risk score (0-100)
    
    Returns:
        Decision: "approved", "review", or "rejected"
    """
    if risk_score < settings.RISK_APPROVED_THRESHOLD:
        return "approved"
    elif risk_score < settings.RISK_REVIEW_THRESHOLD:
        return "review"
    else:
        return "rejected"


def predict_fraud_likelihood(face_confidence: float, fraud_score: float) -> float:
    """
    Use ML model to predict fraud likelihood
    
    Args:
        face_confidence: Face detection confidence (0-1)
        fraud_score: Initial fraud score (0-1)
    
    Returns:
        Fraud probability (0-1)
    """
    try:
        X = np.array([[face_confidence, fraud_score]])
        fraud_prob = AI_RISK_MODEL.predict_proba(X)[0][1]
        return float(fraud_prob)
    except Exception as e:
        print(f"Error in fraud prediction: {e}")
        return fraud_score
