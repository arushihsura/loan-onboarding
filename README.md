# 🎯 Loan Video Intelligence Platform

End-to-end AI-powered loan onboarding, fraud detection, and credit decision platform for digital lenders and banks.

![Python](https://img.shields.io/badge/Python-3.12+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-black)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Face%20AI-orange)
![License](https://img.shields.io/badge/License-MIT-brightgreen)

> A business-facing lending intelligence system that helps banks digitally verify applicants, reduce fraud, automate approvals, and generate explainable credit decisions in real time.

---

## 📊 Results at a Glance

| Metric | Value |
|-------|-------|
| Loan Journey Completion Time | < 3 minutes |
| Fraud Signal Layers | 4 (Face, Audio, Metadata, Bureau) |
| Decision Engine | RandomForest ML |
| Verification Modes | Video + Audio + Device |
| Consent Logging | Yes |
| Explainable Decisions | Yes |
| Audit Trail Storage | PostgreSQL |
| Frontend Modules | Customer + Admin |

---

## 🔑 The Core Value Proposition

Traditional digital loan journeys suffer from:

- High drop-offs
- Fake identities
- Form fraud
- Poor underwriting visibility
- Manual review delays
- Weak auditability

This platform solves that through a **single intelligent verification pipeline**.

---

## 🧠 Platform Modules

### 1️⃣ Audio Intelligence Engine

Extracts borrower insights from voice.

Capabilities:
- Whisper speech-to-text
- Employer extraction
- Income detection
- Employment type detection
- Hesitation and contradiction analysis
- Confidence scoring

Endpoint:

```http
POST /audio-intelligence
```

Legacy compatibility endpoint:

```http
POST /upload-audio
```

### 2️⃣ Face Verification and Liveness

Uses computer vision to validate applicant presence and detect spoofing patterns.

Capabilities:
- Face detection
- Multi-face detection
- Blink detection
- Head-turn liveness
- Replay attack suspicion
- Fraud score generation

Endpoint:

```http
POST /face-verification
```

### 3️⃣ Metadata Risk Engine

Analyzes hidden fraud indicators from network and device context.

Inputs:
- IP address
- Device fingerprint
- Browser profile
- Reported geo vs actual geo
- Repeat device attempts

Sample output:

```json
{
  "device_risk": 71
}
```

Endpoint:

```http
POST /metadata-risk
```

### 4️⃣ Bureau Risk Layer

Scores traditional lending and repayment signals.

Inputs:
- Credit score
- Existing loans
- Defaults
- EMIs
- Debt burden ratio

Outputs:
- Credit grade
- Bureau risk
- Approval tier

Endpoint:

```http
POST /bureau-risk
```

### 5️⃣ AI Decision Engine

Combines all signals into the final underwriting decision.

Model inputs:
- Income
- Face trust
- Geo risk
- Bureau score
- Consent quality
- Employment type

Sample output:

```json
{
  "risk_score": 28,
  "decision": "Approved"
}
```

Endpoint:

```http
POST /ai-risk-engine
```

### 6️⃣ Explainable AI Layer

Converts model outputs into business-readable and reviewer-friendly explanations.

Example:

> Approved because borrower identity verified, income stable, credit healthy, and fraud risk low.

Endpoint:

```http
POST /explain-decision
```

### 7️⃣ Consent Compliance Layer

Captures regulatory proof of customer consent.

Stores:
- Spoken consent
- Timestamp
- Snapshot evidence
- Transcript proof

Endpoint:

```http
POST /consent-compliance
```

### 8️⃣ Audit Logging System

Tracks every critical decision and action for auditability.

Database:
- PostgreSQL

Stores:
- Risk outputs
- Verification results
- Decisions
- Metadata
- Consent logs

Endpoints:

```http
GET /audit-logs
POST /audit-log
```

---

## 🖥️ Frontend Interfaces

### 👤 Customer Portal
- Start loan verification
- Video KYC journey
- Live prompts
- Real-time status

### 🧑‍💼 Admin Dashboard
- Approval analytics
- Fraud trends
- Risk distribution
- Recent applications

---

## ⚙️ Technology Stack

| Layer | Technology |
|-------|------------|
| Backend API | FastAPI |
| Frontend | Next.js |
| Speech AI | Whisper |
| LLM Parsing | Groq |
| Face AI | OpenCV + MediaPipe |
| ML Risk Engine | Scikit-learn |
| Database | PostgreSQL |
| Video Call | Agora |

---

## 📂 Project Structure

```text
loan-video/
│── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── uploads/
│
│── frontend/
│   ├── app/
│   │   ├── page.js
│   │   ├── verify/page.js
│   │   ├── admin/page.js
│   │   ├── layout.js
│   │   └── globals.css
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🚀 Local Setup

### Backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
cd backend
..\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Backend URLs:
- http://127.0.0.1:8000
- http://127.0.0.1:8000/docs

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:
- http://localhost:3000

---

## 🔌 API Overview

| Method | Endpoint |
|--------|----------|
| GET | / |
| POST | /audio-intelligence |
| POST | /upload-audio |
| POST | /face-verification |
| POST | /metadata-risk |
| POST | /bureau-risk |
| POST | /ai-risk-engine |
| POST | /explain-decision |
| POST | /consent-compliance |
| GET | /audit-logs |
| POST | /audit-log |

---

## 📈 Business Impact

- ✅ Faster loan approvals
- ✅ Lower fraud losses
- ✅ Better conversion rates
- ✅ Lower ops costs
- ✅ Full explainability
- ✅ Compliance ready

---

## 🔮 Future Scope

- Aadhaar and PAN OCR verification
- Live banker copilot assistant
- Fraud graph intelligence
- Real-time bureau integrations
- Containerized cloud deployment
- Role-based access controls

---

## 🏆 Ideal Use Cases

- Banks
- NBFCs
- FinTech lenders
- Digital KYC platforms
- AI underwriting systems

---

## 📜 License

MIT License

⭐ If this project helped you, star the repository.
