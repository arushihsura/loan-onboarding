from __future__ import annotations

import json
import hashlib
import os
import re
import shutil
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import cv2
import mediapipe as mp
import numpy as np
import whisper
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.ensemble import RandomForestClassifier

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor, Json
except Exception:
    psycopg2 = None
    RealDictCursor = None
    Json = None

try:
    from groq import Groq
except Exception:
    Groq = None

app = FastAPI(title="Loan Audio Intelligence Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)

whisper_model = whisper.load_model("base")
face_mesh = mp.solutions.face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=2,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)
face_detection = mp.solutions.face_detection.FaceDetection(
    model_selection=0,
    min_detection_confidence=0.5,
)


class FaceVerificationResponse(BaseModel):
    face_present: bool
    multiple_faces: bool
    liveness: bool
    fraud_score: int
    blink_detected: bool
    head_turn_detected: bool
    spoofing_suspected: bool
    frames_analyzed: int
    notes: list[str] = []


class ParsedCustomerData(BaseModel):
    employer: str = "Unknown"
    income: int | None = None
    employment_type: str = "unknown"
    confidence: float = Field(default=0.4, ge=0.0, le=1.0)


class RiskSignals(BaseModel):
    hesitation: bool
    contradiction: bool
    low_confidence: bool
    hesitation_score: float = Field(ge=0.0, le=1.0)
    contradiction_reasons: list[str] = []


class AudioIntelligenceResponse(BaseModel):
    transcript: str
    parsed: ParsedCustomerData
    signals: RiskSignals
    parser_source: str


class MetadataRiskInput(BaseModel):
    reported_country: str | None = None
    reported_city: str | None = None
    timezone: str | None = None
    device_id: str | None = None


class MetadataRiskResponse(BaseModel):
    device_risk: int
    geo_match: bool
    ip_address: str
    device_type: str
    browser_fingerprint: str
    geo_source: str
    application_time: str
    notes: list[str] = Field(default_factory=list)


class BureauRiskInput(BaseModel):
    credit_score: int = Field(ge=300, le=900)
    active_loans: int = Field(default=0, ge=0)
    defaults: int = Field(default=0, ge=0)
    existing_emis: int = Field(default=0, ge=0)
    debt_burden: float = Field(default=0.0, ge=0.0)
    monthly_income: int | None = Field(default=None, ge=0)


class BureauRiskResponse(BaseModel):
    bureau_risk: int
    approval_tier: str
    credit_grade: str
    risk_flags: list[str] = Field(default_factory=list)
    mock_source: bool = True


class AIRiskInput(BaseModel):
    income: int = Field(ge=0)
    employment_type: str = Field(default="unknown")
    face_trust: int = Field(ge=0, le=100)
    geo_risk: int = Field(ge=0, le=100)
    bureau_score: int = Field(ge=300, le=900)
    consent_quality: int = Field(ge=0, le=100)


class AIRiskResponse(BaseModel):
    risk_score: int
    band: str
    decision: str
    model_confidence: float
    feature_notes: list[str] = Field(default_factory=list)


class ExplainabilityInput(BaseModel):
    income: int = Field(ge=0)
    employment_type: str = Field(default="unknown")
    face_present: bool = True
    liveness: bool = True
    multiple_faces: bool = False
    geo_match: bool = True
    bureau_score: int = Field(ge=300, le=900)
    consent_quality: int = Field(ge=0, le=100)
    risk_score: int = Field(ge=0, le=100)
    decision: str = Field(default="Approved")


class ExplainabilityResponse(BaseModel):
    decision: str
    explanation: list[str]
    summary: str


class ConsentCaptureInput(BaseModel):
    transcript: str | None = None
    consent_phrase: str = Field(default="yes i authorize processing")


class ConsentCaptureResponse(BaseModel):
    spoken_consent: bool
    timestamp: str
    transcript: str
    snapshot_path: str | None = None
    notes: list[str] = Field(default_factory=list)


class ConsentCaptureResult(BaseModel):
    spoken_consent: bool
    timestamp: str
    transcript: str
    snapshot_path: str | None = None
    notes: list[str] = Field(default_factory=list)


class AuditLogInput(BaseModel):
    event_type: str
    applicant_id: str | None = None
    transcript: str | None = None
    risk_output: dict[str, Any] | None = None
    face_checks: dict[str, Any] | None = None
    offer_generated: dict[str, Any] | None = None
    metadata: dict[str, Any] | None = None


class AuditLogResponse(BaseModel):
    ok: bool
    audit_id: int | None = None
    source: str


class AuditLogRow(BaseModel):
    id: int
    event_type: str
    applicant_id: str | None = None
    transcript: str | None = None
    risk_output: dict[str, Any] | None = None
    face_checks: dict[str, Any] | None = None
    offer_generated: dict[str, Any] | None = None
    metadata: dict[str, Any] | None = None
    created_at: str


DEVICE_SEEN_COUNTS: dict[str, int] = defaultdict(int)
AI_RISK_MODEL: RandomForestClassifier | None = None
AUDIT_TABLE_NAME = "audit_logs"


def _employment_to_score(employment_type: str) -> int:
    normalized = (employment_type or "unknown").strip().lower()
    if normalized == "salaried":
        return 0
    if normalized == "self_employed":
        return 10
    if normalized == "student":
        return 20
    if normalized == "unemployed":
        return 35
    return 12


def _feature_vector(
    income: int,
    employment_type: str,
    face_trust: int,
    geo_risk: int,
    bureau_score: int,
    consent_quality: int,
) -> list[float]:
    income_band = min(income / 200000.0, 1.0)
    bureau_band = max(0.0, min((bureau_score - 300) / 600.0, 1.0))
    employment_score = _employment_to_score(employment_type) / 100.0
    return [
        income_band,
        employment_score,
        face_trust / 100.0,
        geo_risk / 100.0,
        bureau_band,
        consent_quality / 100.0,
    ]


def _rule_label(
    income: int,
    employment_type: str,
    face_trust: int,
    geo_risk: int,
    bureau_score: int,
    consent_quality: int,
) -> str:
    employment_score = _employment_to_score(employment_type)
    risk_penalty = (
        (100000 - min(income, 100000)) / 2200.0
        + employment_score * 0.8
        + (100 - face_trust) * 0.75
        + geo_risk * 0.9
        + max(0, 700 - bureau_score) * 0.14
        + (100 - consent_quality) * 0.7
    )

    if bureau_score >= 740 and face_trust >= 82 and geo_risk <= 18 and consent_quality >= 85 and income >= 45000:
        return "approve"
    if bureau_score < 620 or geo_risk >= 70 or face_trust < 45 or consent_quality < 45:
        return "reject"
    if risk_penalty <= 75:
        return "approve"
    if risk_penalty <= 125:
        return "manual_review"
    return "reject"


def _train_ai_risk_model() -> RandomForestClassifier:
    rng = np.random.default_rng(42)
    samples: list[list[float]] = []
    labels: list[str] = []

    for _ in range(1400):
        income = int(rng.integers(10000, 250000))
        employment_type = rng.choice(["salaried", "self_employed", "unknown", "unemployed", "student"]).item()
        face_trust = int(rng.integers(20, 101))
        geo_risk = int(rng.integers(0, 101))
        bureau_score = int(rng.integers(300, 901))
        consent_quality = int(rng.integers(20, 101))

        samples.append(_feature_vector(income, employment_type, face_trust, geo_risk, bureau_score, consent_quality))
        labels.append(_rule_label(income, employment_type, face_trust, geo_risk, bureau_score, consent_quality))

    model = RandomForestClassifier(
        n_estimators=120,
        max_depth=8,
        random_state=42,
        class_weight="balanced_subsample",
    )
    model.fit(samples, labels)
    return model


AI_RISK_MODEL = _train_ai_risk_model()


def _database_url() -> str | None:
    return os.getenv("DATABASE_URL")


def _db_available() -> bool:
    return bool(_database_url() and psycopg2 is not None)


def _get_db_connection():
    if not _db_available():
        return None
    return psycopg2.connect(_database_url())


def _init_audit_table() -> None:
    if not _db_available():
        return

    ddl = f"""
    CREATE TABLE IF NOT EXISTS {AUDIT_TABLE_NAME} (
        id BIGSERIAL PRIMARY KEY,
        event_type TEXT NOT NULL,
        applicant_id TEXT,
        transcript TEXT,
        risk_output JSONB,
        face_checks JSONB,
        offer_generated JSONB,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """

    with _get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(ddl)
        connection.commit()


def _write_audit_log(payload: AuditLogInput) -> AuditLogResponse:
    if not _db_available():
        return AuditLogResponse(ok=False, audit_id=None, source="db_unavailable")

    insert_sql = f"""
    INSERT INTO {AUDIT_TABLE_NAME} (
        event_type,
        applicant_id,
        transcript,
        risk_output,
        face_checks,
        offer_generated,
        metadata
    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
    RETURNING id
    """

    with _get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                insert_sql,
                (
                    payload.event_type,
                    payload.applicant_id,
                    payload.transcript,
                    Json(payload.risk_output) if payload.risk_output is not None else None,
                    Json(payload.face_checks) if payload.face_checks is not None else None,
                    Json(payload.offer_generated) if payload.offer_generated is not None else None,
                    Json(payload.metadata) if payload.metadata is not None else None,
                ),
            )
            audit_id = cursor.fetchone()[0]
        connection.commit()

    return AuditLogResponse(ok=True, audit_id=int(audit_id), source="postgres")


def _fetch_recent_audit_logs(limit: int = 25) -> list[AuditLogRow]:
    if not _db_available():
        return []

    query = f"""
    SELECT id, event_type, applicant_id, transcript, risk_output, face_checks, offer_generated, metadata, created_at
    FROM {AUDIT_TABLE_NAME}
    ORDER BY created_at DESC
    LIMIT %s
    """

    with _get_db_connection() as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, (limit,))
            rows = cursor.fetchall()

    return [
        AuditLogRow(
            id=int(row["id"]),
            event_type=row["event_type"],
            applicant_id=row.get("applicant_id"),
            transcript=row.get("transcript"),
            risk_output=row.get("risk_output"),
            face_checks=row.get("face_checks"),
            offer_generated=row.get("offer_generated"),
            metadata=row.get("metadata"),
            created_at=row["created_at"].isoformat(),
        )
        for row in rows
    ]


@app.on_event("startup")
def _startup_audit_setup() -> None:
    _init_audit_table()


def _extract_income(text: str) -> int | None:
    lowered = text.lower()
    lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*lakh", lowered)
    if lakh_match:
        return int(float(lakh_match.group(1)) * 100000)

    thousand_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:thousand|k)\b", lowered)
    if thousand_match:
        return int(float(thousand_match.group(1)) * 1000)

    # Handles formats like 62000 or 62,000.
    numeric_candidates = re.findall(r"\b\d{2,3}(?:,\d{3})*\b|\b\d{5,7}\b", text)
    if not numeric_candidates:
        return None

    cleaned = [int(candidate.replace(",", "")) for candidate in numeric_candidates]
    return max(cleaned) if cleaned else None


def _extract_employer(text: str) -> str:
    patterns = [
        r"work(?:ing)?\s+(?:at|in|with)\s+([A-Za-z0-9&.\-\s]{2,40})",
        r"employed\s+(?:at|in|with)\s+([A-Za-z0-9&.\-\s]{2,40})",
        r"my company is\s+([A-Za-z0-9&.\-\s]{2,40})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            employer = match.group(1).strip(" .,")
            return employer.upper() if len(employer) <= 6 else employer.title()
    return "Unknown"


def _extract_employment_type(text: str) -> str:
    lowered = text.lower()
    if any(word in lowered for word in ["salary", "salaried", "payroll", "employee"]):
        return "salaried"
    if any(word in lowered for word in ["business", "self employed", "freelance", "consultant"]):
        return "self_employed"
    return "unknown"


def _estimate_confidence(text: str, income: int | None, employer: str, employment_type: str) -> float:
    confidence = 0.45
    if income is not None:
        confidence += 0.2
    if employer != "Unknown":
        confidence += 0.2
    if employment_type != "unknown":
        confidence += 0.1

    hedge_terms = ["maybe", "around", "approximately", "i think", "not sure", "perhaps"]
    hedge_hits = sum(1 for term in hedge_terms if term in text.lower())
    confidence -= min(hedge_hits * 0.04, 0.2)

    return round(max(0.05, min(confidence, 0.99)), 2)


def _parse_with_fallback(text: str) -> ParsedCustomerData:
    income = _extract_income(text)
    employer = _extract_employer(text)
    employment_type = _extract_employment_type(text)
    confidence = _estimate_confidence(text, income, employer, employment_type)

    return ParsedCustomerData(
        employer=employer,
        income=income,
        employment_type=employment_type,
        confidence=confidence,
    )


def _safe_json_extract(content: str) -> dict[str, Any] | None:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if not json_match:
            return None
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            return None


def _parse_with_groq(text: str) -> ParsedCustomerData | None:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or Groq is None:
        return None

    try:
        client = Groq(api_key=api_key)
        prompt = (
            "Extract structured borrower profile from transcript. "
            "Return strict JSON with keys employer (string), income (number or null), "
            "employment_type (salaried|self_employed|unknown), confidence (0 to 1)."
        )
        completion = client.chat.completions.create(
            model=os.getenv("GROQ_PARSER_MODEL", "llama-3.1-70b-versatile"),
            temperature=0,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": text},
            ],
        )
        message_content = completion.choices[0].message.content or "{}"
        parsed_json = _safe_json_extract(message_content)
        if not parsed_json:
            return None

        return ParsedCustomerData(
            employer=str(parsed_json.get("employer", "Unknown"))[:80] or "Unknown",
            income=int(parsed_json["income"]) if parsed_json.get("income") is not None else None,
            employment_type=str(parsed_json.get("employment_type", "unknown")),
            confidence=float(parsed_json.get("confidence", 0.5)),
        )
    except Exception:
        return None


def _detect_hesitation(text: str) -> tuple[bool, float]:
    lowered = text.lower()
    fillers = ["uh", "um", "hmm", "let me think", "you know", "like", "actually"]
    hedges = ["maybe", "around", "approximately", "probably", "i think", "not sure"]

    filler_hits = sum(len(re.findall(rf"\b{re.escape(word)}\b", lowered)) for word in fillers)
    hedge_hits = sum(len(re.findall(rf"\b{re.escape(word)}\b", lowered)) for word in hedges)
    pause_hits = len(re.findall(r"\.\.\.|\s-\s", text))

    score = min((filler_hits * 0.12) + (hedge_hits * 0.1) + (pause_hits * 0.08), 1.0)
    return score >= 0.35, round(score, 2)


def _detect_contradictions(text: str, parsed: ParsedCustomerData) -> tuple[bool, list[str]]:
    lowered = text.lower()
    reasons: list[str] = []

    if "consent" in lowered and ("do not consent" in lowered or "don't consent" in lowered):
        reasons.append("Explicit consent denial detected")

    if "agree" in lowered and any(neg in lowered for neg in ["do not", "don't", "not"]):
        reasons.append("Conflicting consent statement detected")

    incomes = [int(value.replace(",", "")) for value in re.findall(r"\b\d{2,3}(?:,\d{3})*\b|\b\d{5,7}\b", text)]
    if len(incomes) >= 2:
        min_income, max_income = min(incomes), max(incomes)
        if min_income > 0 and (max_income / min_income) >= 2.5:
            reasons.append("Large mismatch between multiple income declarations")

    if parsed.employment_type == "salaried" and any(word in lowered for word in ["self employed", "business owner"]):
        reasons.append("Employment type mentions both salaried and self-employed cues")

    return len(reasons) > 0, reasons


def _build_signals(text: str, parsed: ParsedCustomerData) -> RiskSignals:
    hesitation, hesitation_score = _detect_hesitation(text)
    contradiction, reasons = _detect_contradictions(text, parsed)
    low_confidence = parsed.confidence < 0.6

    return RiskSignals(
        hesitation=hesitation,
        contradiction=contradiction,
        low_confidence=low_confidence,
        hesitation_score=hesitation_score,
        contradiction_reasons=reasons,
    )


def _transcribe_audio(path: Path) -> str:
    result = whisper_model.transcribe(str(path))
    return (result.get("text") or "").strip()


def _normalize_text(value: str | None) -> str:
    return (value or "").strip().lower()


def _extract_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    return request.client.host if request.client else "unknown"


def _device_type_from_user_agent(user_agent: str) -> str:
    ua = user_agent.lower()
    if any(token in ua for token in ["ipad", "tablet"]):
        return "tablet"
    if any(token in ua for token in ["mobi", "android", "iphone"]):
        return "mobile"
    if any(token in ua for token in ["windows", "macintosh", "linux"]):
        return "desktop"
    return "unknown"


def _browser_fingerprint(request: Request, payload: MetadataRiskInput) -> str:
    parts = [
        request.headers.get("user-agent", ""),
        request.headers.get("accept-language", ""),
        request.headers.get("sec-ch-ua", ""),
        request.headers.get("sec-ch-ua-platform", ""),
        request.headers.get("sec-ch-ua-mobile", ""),
        payload.device_id or "",
    ]
    raw = "|".join(parts)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def _lookup_geo_from_ip(ip_address: str) -> dict[str, str]:
    if not ip_address or ip_address == "unknown":
        return {}

    try:
        with urllib.request.urlopen(f"https://ipapi.co/{ip_address}/json/", timeout=3) as response:
            data = json.loads(response.read().decode("utf-8"))
            return {
                "country": str(data.get("country_name") or "").strip(),
                "city": str(data.get("city") or "").strip(),
                "region": str(data.get("region") or "").strip(),
            }
    except Exception:
        return {}


def _geo_matches(reported_country: str | None, reported_city: str | None, lookup: dict[str, str]) -> bool:
    if not lookup:
        return True

    country = _normalize_text(reported_country)
    city = _normalize_text(reported_city)
    lookup_country = _normalize_text(lookup.get("country"))
    lookup_city = _normalize_text(lookup.get("city"))

    country_ok = not country or not lookup_country or country == lookup_country or country in lookup_country or lookup_country in country
    city_ok = not city or not lookup_city or city == lookup_city or city in lookup_city or lookup_city in city
    return country_ok and city_ok


def _score_metadata_risk(request: Request, payload: MetadataRiskInput) -> MetadataRiskResponse:
    ip_address = _extract_client_ip(request)
    user_agent = request.headers.get("user-agent", "")
    device_type = _device_type_from_user_agent(user_agent)
    fingerprint = _browser_fingerprint(request, payload)
    geo_lookup = _lookup_geo_from_ip(ip_address)
    geo_match = _geo_matches(payload.reported_country, payload.reported_city, geo_lookup)

    device_risk = 12
    notes: list[str] = []

    if device_type == "unknown":
        device_risk += 8
        notes.append("Device type could not be classified")

    seen_count = DEVICE_SEEN_COUNTS[fingerprint] + 1
    DEVICE_SEEN_COUNTS[fingerprint] = seen_count
    if seen_count >= 10:
        device_risk += 28
        notes.append("Same device fingerprint applied multiple times")
    elif seen_count >= 5:
        device_risk += 18
        notes.append("Repeated applications from the same device fingerprint")

    current_hour = datetime.now(timezone.utc).hour
    if 0 <= current_hour <= 5:
        device_risk += 12
        notes.append("Application submitted during midnight window")

    if request.headers.get("x-requested-with") == "XMLHttpRequest":
        device_risk += 3

    if not geo_match:
        device_risk += 22
        notes.append("Reported geo does not match IP geo lookup")

    if payload.timezone:
        tz = payload.timezone.lower()
        if any(token in tz for token in ["utc+", "utc-"]):
            device_risk += 2

    if payload.device_id and len(payload.device_id) < 8:
        device_risk += 5

    if "webdriver" in user_agent.lower():
        device_risk += 25
        notes.append("Automation-like browser fingerprint detected")

    if geo_lookup and payload.reported_country and _normalize_text(payload.reported_country) != _normalize_text(geo_lookup.get("country")):
        notes.append(f"IP geo: {geo_lookup.get('country') or 'unknown'}")

    device_risk = int(max(0, min(device_risk, 100)))

    return MetadataRiskResponse(
        device_risk=device_risk,
        geo_match=geo_match,
        ip_address=ip_address,
        device_type=device_type,
        browser_fingerprint=fingerprint,
        geo_source="ip_lookup" if geo_lookup else "header_fallback",
        application_time=datetime.now(timezone.utc).isoformat(),
        notes=notes,
    )


def _credit_grade(credit_score: int) -> str:
    if credit_score >= 750:
        return "A"
    if credit_score >= 700:
        return "B"
    if credit_score >= 650:
        return "C"
    if credit_score >= 600:
        return "D"
    return "E"


def _approval_tier(credit_score: int, bureau_risk: int) -> str:
    if credit_score >= 750 and bureau_risk <= 20:
        return "premium"
    if credit_score >= 700 and bureau_risk <= 35:
        return "standard"
    if credit_score >= 650 and bureau_risk <= 55:
        return "review"
    return "decline"


def _score_bureau_risk(payload: BureauRiskInput) -> BureauRiskResponse:
    risk_flags: list[str] = []
    bureau_risk = 0

    if payload.credit_score >= 800:
        bureau_risk += 0
    elif payload.credit_score >= 750:
        bureau_risk += 6
    elif payload.credit_score >= 700:
        bureau_risk += 14
    elif payload.credit_score >= 650:
        bureau_risk += 24
        risk_flags.append("Credit score in borderline range")
    elif payload.credit_score >= 600:
        bureau_risk += 38
        risk_flags.append("Subprime credit score band")
    else:
        bureau_risk += 58
        risk_flags.append("Very weak credit score")

    if payload.defaults > 0:
        bureau_risk += min(28 + (payload.defaults * 8), 50)
        risk_flags.append("Past default history present")

    if payload.active_loans >= 4:
        bureau_risk += 16
        risk_flags.append("High number of active loans")
    elif payload.active_loans == 3:
        bureau_risk += 10
    elif payload.active_loans == 2:
        bureau_risk += 5

    if payload.existing_emis >= 3:
        bureau_risk += 14
        risk_flags.append("Multiple existing EMIs detected")
    elif payload.existing_emis == 2:
        bureau_risk += 8

    debt_pressure = payload.debt_burden
    if payload.monthly_income and payload.monthly_income > 0 and payload.existing_emis > 0:
        computed_burden = (payload.existing_emis * 1000) / payload.monthly_income
        debt_pressure = max(debt_pressure, round(computed_burden, 2))

    if debt_pressure >= 0.6:
        bureau_risk += 24
        risk_flags.append("Debt burden is very high")
    elif debt_pressure >= 0.45:
        bureau_risk += 16
        risk_flags.append("Debt burden is elevated")
    elif debt_pressure >= 0.3:
        bureau_risk += 8

    if payload.credit_score >= 720 and payload.defaults == 0 and payload.active_loans <= 2 and debt_pressure < 0.35:
        bureau_risk = max(0, bureau_risk - 12)

    bureau_risk = int(max(0, min(bureau_risk, 100)))
    grade = _credit_grade(payload.credit_score)
    approval_tier = _approval_tier(payload.credit_score, bureau_risk)

    if approval_tier == "decline" and not risk_flags:
        risk_flags.append("Risk score too high for auto approval")

    return BureauRiskResponse(
        bureau_risk=bureau_risk,
        approval_tier=approval_tier,
        credit_grade=grade,
        risk_flags=risk_flags,
    )


def _risk_band(risk_score: int) -> str:
    if risk_score <= 30:
        return "Low"
    if risk_score <= 60:
        return "Medium"
    return "High"


def _decision_from_label(label: str) -> str:
    mapping = {
        "approve": "Approved",
        "manual_review": "Manual Review",
        "reject": "Rejected",
    }
    return mapping.get(label, "Manual Review")


def _plain_english_decision_label(decision: str) -> str:
    normalized = (decision or "").strip().lower()
    if normalized in {"approved", "approve"}:
        return "Approved"
    if normalized in {"rejected", "reject"}:
        return "Rejected"
    return "Manual Review"


def _build_explanation(payload: ExplainabilityInput) -> ExplainabilityResponse:
    explanation: list[str] = []
    normalized_employment = (payload.employment_type or "unknown").strip().lower()

    if payload.face_present and payload.liveness and not payload.multiple_faces:
        explanation.append("Verified identity through face verification and liveness checks")
    else:
        if not payload.face_present:
            explanation.append("Face not consistently visible")
        if payload.multiple_faces:
            explanation.append("Multiple people detected in the frame")
        if not payload.liveness:
            explanation.append("Liveness signals were weak")

    if normalized_employment == "salaried" and payload.income >= 45000:
        explanation.append("Stable salaried income was confirmed")
    elif normalized_employment == "self_employed":
        explanation.append("Income source is self-employed and requires closer review")
    else:
        explanation.append("Employment profile was not strong enough to fully validate income stability")

    if payload.bureau_score >= 740:
        explanation.append("Strong credit profile supported the decision")
    elif payload.bureau_score >= 650:
        explanation.append("Credit profile was acceptable but not fully strong")
    else:
        explanation.append("Credit profile showed elevated risk")

    if payload.geo_match and payload.risk_score <= 35:
        explanation.append("Low fraud indicators were observed across device and geo layers")
    elif not payload.geo_match:
        explanation.append("Geo signals did not fully align with the declared profile")

    if payload.consent_quality >= 80:
        explanation.append("Consent quality was clear and legally usable")
    elif payload.consent_quality < 60:
        explanation.append("Consent capture quality was weak")

    if payload.risk_score <= 30:
        summary = "The application was approved because identity, income, credit, and fraud signals were all favorable."
    elif payload.risk_score <= 60:
        summary = "The application needs manual review because the combined signals are mixed."
    else:
        summary = "The application was rejected because risk signals outweighed the positive signals."

    return ExplainabilityResponse(
        decision=_plain_english_decision_label(payload.decision),
        explanation=explanation,
        summary=summary,
    )


def _detect_spoken_consent(text: str, consent_phrase: str) -> bool:
    normalized = _normalize_text(text)
    phrase = _normalize_text(consent_phrase)
    if phrase and phrase in normalized:
        return True

    positive_markers = [
        "yes i authorize processing",
        "i authorize processing",
        "i consent",
        "i agree",
        "yes",
        "authorize",
        "consent",
    ]
    negations = ["do not", "don't", "no", "not agree", "withdraw"]
    if any(marker in normalized for marker in positive_markers) and not any(marker in normalized for marker in negations):
        return True
    return False


def _capture_consent_evidence(
    audio_text: str | None,
    snapshot: UploadFile | None,
    consent_phrase: str,
) -> ConsentCaptureResult:
    transcript = (audio_text or "").strip()
    spoken_consent = _detect_spoken_consent(transcript, consent_phrase)
    timestamp = datetime.now(timezone.utc).isoformat()
    notes: list[str] = []
    snapshot_path: str | None = None

    if not transcript:
        notes.append("No transcript supplied")
    elif spoken_consent:
        notes.append("Spoken consent detected from transcript")
    else:
        notes.append("Consent phrase not found in transcript")

    if snapshot and snapshot.filename:
        safe_name = f"consent_snapshot_{Path(snapshot.filename).stem}_{os.getpid()}{Path(snapshot.filename).suffix}"
        path = UPLOAD_FOLDER / safe_name
        with path.open("wb") as buffer:
            shutil.copyfileobj(snapshot.file, buffer)
        snapshot_path = str(path)
        notes.append("Video snapshot captured")

    return ConsentCaptureResult(
        spoken_consent=spoken_consent,
        timestamp=timestamp,
        transcript=transcript,
        snapshot_path=snapshot_path,
        notes=notes,
    )


def _score_ai_risk(payload: AIRiskInput) -> AIRiskResponse:
    if AI_RISK_MODEL is None:
        raise HTTPException(status_code=503, detail="AI risk model is not initialized")

    features = _feature_vector(
        payload.income,
        payload.employment_type,
        payload.face_trust,
        payload.geo_risk,
        payload.bureau_score,
        payload.consent_quality,
    )
    probabilities = AI_RISK_MODEL.predict_proba([features])[0]
    classes = list(AI_RISK_MODEL.classes_)
    predicted_label = classes[int(np.argmax(probabilities))]

    reject_index = classes.index("reject") if "reject" in classes else 0
    review_index = classes.index("manual_review") if "manual_review" in classes else reject_index
    approve_index = classes.index("approve") if "approve" in classes else review_index

    weighted_risk = (
        probabilities[reject_index] * 100.0
        + probabilities[review_index] * 62.0
        + probabilities[approve_index] * 18.0
    )

    feature_notes: list[str] = []
    if payload.face_trust < 60:
        feature_notes.append("Face trust is weak")
    if payload.geo_risk > 50:
        feature_notes.append("Geo risk is elevated")
    if payload.consent_quality < 60:
        feature_notes.append("Consent quality is weak")
    if payload.bureau_score < 650:
        feature_notes.append("Bureau score is below preferred range")
    if _employment_to_score(payload.employment_type) >= 20:
        feature_notes.append("Employment profile requires manual scrutiny")

    risk_score = int(max(0, min(round(weighted_risk), 100)))
    band = _risk_band(risk_score)

    if predicted_label == "approve" and risk_score > 55:
        predicted_label = "manual_review"
    if predicted_label == "reject" and risk_score < 40:
        predicted_label = "manual_review"

    return AIRiskResponse(
        risk_score=risk_score,
        band=band,
        decision=_decision_from_label(predicted_label),
        model_confidence=round(float(max(probabilities)), 2),
        feature_notes=feature_notes,
    )


def _landmark_point(landmarks: Any, landmark_index: int, width: int, height: int) -> np.ndarray:
    point = landmarks.landmark[landmark_index]
    return np.array([point.x * width, point.y * height], dtype=np.float32)


def _eye_aspect_ratio(landmarks: Any, width: int, height: int, left: bool = True) -> float:
    if left:
        indices = (33, 160, 158, 133, 153, 144)
    else:
        indices = (362, 385, 387, 263, 373, 380)

    p1 = _landmark_point(landmarks, indices[0], width, height)
    p2 = _landmark_point(landmarks, indices[1], width, height)
    p3 = _landmark_point(landmarks, indices[2], width, height)
    p4 = _landmark_point(landmarks, indices[3], width, height)
    p5 = _landmark_point(landmarks, indices[4], width, height)
    p6 = _landmark_point(landmarks, indices[5], width, height)

    vertical_1 = np.linalg.norm(p2 - p6)
    vertical_2 = np.linalg.norm(p3 - p5)
    horizontal = np.linalg.norm(p1 - p4)
    if horizontal == 0:
        return 0.0
    return float((vertical_1 + vertical_2) / (2.0 * horizontal))


def _head_turn_score(landmarks: Any, width: int, height: int) -> float:
    nose = _landmark_point(landmarks, 1, width, height)
    left_eye = _landmark_point(landmarks, 33, width, height)
    right_eye = _landmark_point(landmarks, 263, width, height)
    eye_center = (left_eye + right_eye) / 2.0
    eye_distance = np.linalg.norm(right_eye - left_eye)
    if eye_distance == 0:
        return 0.0
    return float(abs(nose[0] - eye_center[0]) / eye_distance)


def _analyze_face_verification(video_path: Path) -> FaceVerificationResponse:
    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        raise HTTPException(status_code=400, detail="Unable to open uploaded video")

    frame_count = 0
    face_present_frames = 0
    multi_face_frames = 0
    blink_detected = False
    head_turn_detected = False
    low_motion_frames = 0
    total_motion = 0.0
    previous_gray = None
    eye_closed_streak = 0
    notes: list[str] = []

    while frame_count < 60:
        success, frame = capture.read()
        if not success:
            break

        frame_count += 1
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        height, width = frame.shape[:2]

        detection_result = face_detection.process(rgb)
        detected_faces = detection_result.detections or []
        if detected_faces:
            face_present_frames += 1
        if len(detected_faces) > 1:
            multi_face_frames += 1

        mesh_result = face_mesh.process(rgb)
        if mesh_result.multi_face_landmarks:
            landmarks = mesh_result.multi_face_landmarks[0]
            left_ear = _eye_aspect_ratio(landmarks, width, height, left=True)
            right_ear = _eye_aspect_ratio(landmarks, width, height, left=False)
            ear = (left_ear + right_ear) / 2.0
            if ear < 0.21:
                eye_closed_streak += 1
            else:
                if eye_closed_streak >= 2:
                    blink_detected = True
                eye_closed_streak = 0

            if _head_turn_score(landmarks, width, height) > 0.22:
                head_turn_detected = True

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if previous_gray is not None:
            motion = float(np.mean(cv2.absdiff(gray, previous_gray)))
            total_motion += motion
            if motion < 2.0:
                low_motion_frames += 1
        previous_gray = gray

    capture.release()

    face_present = face_present_frames > 0
    multiple_faces = multi_face_frames > max(1, frame_count // 8)
    liveness = blink_detected or head_turn_detected

    spoofing_suspected = False
    fraud_score = 0

    if not face_present:
        fraud_score += 55
        notes.append("No visible face detected")
    if multiple_faces:
        fraud_score += 30
        notes.append("Multiple faces detected in the frame")
    if not blink_detected:
        fraud_score += 15
        notes.append("Blink not detected")
    if not head_turn_detected:
        fraud_score += 10
        notes.append("Head turn not detected")

    if frame_count > 0:
        avg_motion = total_motion / max(1, frame_count - 1)
        if face_present and avg_motion < 2.2 and not liveness:
            spoofing_suspected = True
            fraud_score += 18
            notes.append("Low motion pattern resembles replay or printed photo spoofing")
        if low_motion_frames >= max(8, frame_count // 3):
            spoofing_suspected = True
            fraud_score += 10
            notes.append("Too many low-motion frames")

    if face_present and not multiple_faces and liveness:
        fraud_score = max(0, fraud_score - 15)

    fraud_score = int(max(0, min(fraud_score, 100)))

    return FaceVerificationResponse(
        face_present=face_present,
        multiple_faces=multiple_faces,
        liveness=liveness,
        fraud_score=fraud_score,
        blink_detected=blink_detected,
        head_turn_detected=head_turn_detected,
        spoofing_suspected=spoofing_suspected,
        frames_analyzed=frame_count,
        notes=notes,
    )


@app.get("/")
def home() -> dict[str, str]:
    return {"message": "Loan AI Backend Running"}


@app.post("/audio-intelligence", response_model=AudioIntelligenceResponse)
async def audio_intelligence(file: UploadFile = File(...)) -> AudioIntelligenceResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name missing")

    safe_name = f"{Path(file.filename).stem}_{os.getpid()}{Path(file.filename).suffix}"
    path = UPLOAD_FOLDER / safe_name

    try:
        with path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        transcript = _transcribe_audio(path)
        if not transcript:
            raise HTTPException(status_code=400, detail="No speech detected in audio")

        llm_parsed = _parse_with_groq(transcript)
        parsed = llm_parsed if llm_parsed else _parse_with_fallback(transcript)
        parser_source = "groq" if llm_parsed else "fallback"
        signals = _build_signals(transcript, parsed)

        response = AudioIntelligenceResponse(
            transcript=transcript,
            parsed=parsed,
            signals=signals,
            parser_source=parser_source,
        )
        _write_audit_log(
            AuditLogInput(
                event_type="audio_intelligence",
                transcript=response.transcript,
                risk_output={
                    "parsed": response.parsed.model_dump(),
                    "signals": response.signals.model_dump(),
                    "parser_source": response.parser_source,
                },
            )
        )
        return response
    finally:
        if path.exists():
            path.unlink(missing_ok=True)


@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)) -> dict[str, Any]:
    # Legacy route preserved for compatibility with older frontend modules.
    response = await audio_intelligence(file=file)
    return {
        "transcript": response.transcript,
        "income": response.parsed.income,
        "consent": not response.signals.contradiction,
        "parsed": response.parsed.model_dump(),
        "signals": response.signals.model_dump(),
        "parser_source": response.parser_source,
    }


@app.post("/face-verification", response_model=FaceVerificationResponse)
async def face_verification(file: UploadFile = File(...)) -> FaceVerificationResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name missing")

    safe_name = f"{Path(file.filename).stem}_{os.getpid()}{Path(file.filename).suffix}"
    path = UPLOAD_FOLDER / safe_name

    try:
        with path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        response = _analyze_face_verification(path)
        _write_audit_log(
            AuditLogInput(
                event_type="face_verification",
                face_checks=response.model_dump(),
            )
        )
        return response
    finally:
        if path.exists():
            path.unlink(missing_ok=True)


@app.post("/metadata-risk", response_model=MetadataRiskResponse)
async def metadata_risk(request: Request, payload: MetadataRiskInput) -> MetadataRiskResponse:
    response = _score_metadata_risk(request, payload)
    _write_audit_log(
        AuditLogInput(
            event_type="metadata_risk",
            metadata={
                "reported_country": payload.reported_country,
                "reported_city": payload.reported_city,
                "timezone": payload.timezone,
                "device_id": payload.device_id,
                "result": response.model_dump(),
            },
        )
    )
    return response


@app.post("/bureau-risk", response_model=BureauRiskResponse)
async def bureau_risk(payload: BureauRiskInput) -> BureauRiskResponse:
    response = _score_bureau_risk(payload)
    _write_audit_log(
        AuditLogInput(
            event_type="bureau_risk",
            risk_output={"input": payload.model_dump(), "result": response.model_dump()},
        )
    )
    return response


@app.post("/ai-risk-engine", response_model=AIRiskResponse)
async def ai_risk_engine(payload: AIRiskInput) -> AIRiskResponse:
    response = _score_ai_risk(payload)
    _write_audit_log(
        AuditLogInput(
            event_type="ai_risk_engine",
            risk_output={"input": payload.model_dump(), "result": response.model_dump()},
            offer_generated=response.model_dump(),
        )
    )
    return response


@app.post("/explain-decision", response_model=ExplainabilityResponse)
async def explain_decision(payload: ExplainabilityInput) -> ExplainabilityResponse:
    response = _build_explanation(payload)
    _write_audit_log(
        AuditLogInput(
            event_type="explainability",
            offer_generated=response.model_dump(),
            risk_output={"input": payload.model_dump()},
        )
    )
    return response


@app.post("/consent-compliance", response_model=ConsentCaptureResponse)
async def consent_compliance(
    transcript: str = Form(default=""),
    consent_phrase: str = Form(default="yes i authorize processing"),
    snapshot: UploadFile | None = File(default=None),
) -> ConsentCaptureResponse:
    result = _capture_consent_evidence(transcript, snapshot, consent_phrase)
    _write_audit_log(
        AuditLogInput(
            event_type="consent_capture",
            transcript=result.transcript,
            metadata={
                "spoken_consent": result.spoken_consent,
                "timestamp": result.timestamp,
                "snapshot_path": result.snapshot_path,
                "notes": result.notes,
            },
        )
    )
    return ConsentCaptureResponse(**result.model_dump())


@app.get("/audit-logs", response_model=list[AuditLogRow])
def audit_logs(limit: int = 25) -> list[AuditLogRow]:
    return _fetch_recent_audit_logs(limit=limit)


@app.post("/audit-log", response_model=AuditLogResponse)
def audit_log(payload: AuditLogInput) -> AuditLogResponse:
    return _write_audit_log(payload)