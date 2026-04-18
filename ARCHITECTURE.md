# Loan Video - Enterprise Architecture

## Project Structure

### Frontend (Next.js 14 with App Router)
```
frontend/
├── app/                          # App Router directory
│   ├── (auth)/                  # Route group: Auth pages
│   │   ├── login/page.js
│   │   └── signup/page.js
│   │
│   ├── (user)/                  # Route group: Authenticated user pages
│   │   ├── dashboard/page.js
│   │   ├── profile/page.js
│   │   ├── offer/page.js
│   │   ├── application-status/page.js
│   │   └── onboarding/page.js
│   │
│   ├── (marketing)/             # Route group: Public marketing pages
│   │   ├── page.js              # Homepage
│   │   └── showcase/page.js
│   │
│   ├── admin/
│   │   └── page.js
│   │
│   ├── layout.js                # Root layout
│   └── globals.css              # Global styles
│
├── components/                   # Reusable React components
│   ├── ui/                      # UI primitives (buttons, cards, etc.)
│   ├── onboarding/              # Onboarding-specific components
│   ├── dashboard/               # Dashboard components
│   ├── auth/                    # Auth components
│   └── shared/                  # Shared across multiple features
│
├── context/                      # React Context providers
│   └── AuthContext.js
│
├── lib/                         # Utility functions & API clients
│   ├── api.js                   # Centralized API client
│   ├── auth.js                  # Auth utilities
│   └── utils.js                 # General utilities
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.js
│   └── useApi.js
│
├── public/                      # Static assets
├── middleware.js                # Next.js middleware
├── package.json
└── .env.local                   # Environment variables
```

### Backend (FastAPI)
```
backend/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   │
│   ├── core/                    # Core configuration & security
│   │   ├── config.py            # Environment config
│   │   └── security.py          # Auth/security utilities
│   │
│   ├── api/                     # API route modules
│   │   ├── auth.py              # Auth endpoints
│   │   ├── onboarding.py        # Video KYC endpoints
│   │   ├── loans.py             # Loan endpoints
│   │   ├── users.py             # User endpoints
│   │   └── admin.py             # Admin endpoints
│   │
│   ├── services/                # Business logic & external integrations
│   │   ├── whisper_service.py   # Speech-to-text
│   │   ├── cv_service.py        # Computer vision (face detection)
│   │   ├── risk_service.py      # Risk scoring engine
│   │   └── chatbot_service.py   # LLM chatbot
│   │
│   ├── models/                  # MongoDB document models
│   │   ├── user.py
│   │   ├── loan.py
│   │   ├── session.py
│   │   └── verification.py
│   │
│   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── user.py
│   │   ├── loan.py
│   │   └── session.py
│   │
│   ├── db/                      # Database configuration
│   │   ├── mongo.py             # MongoDB connection
│   │   └── session.py           # DB session management
│   │
│   └── utils/                   # Utilities
│       └── logger.py
│
├── requirements.txt
├── .env                         # Environment variables
└── .env.example                 # Example env
```

## Design Principles

### Frontend
- **Route Groups**: Logical grouping of related pages
- **Component Hierarchy**: UI components → Feature components → Pages
- **Centralized API**: Single `lib/api.js` for all backend calls
- **Context API**: For shared state (Auth, User data)
- **Hooks**: Reusable logic extraction

### Backend
- **Separation of Concerns**: Routes → Services → Data Layer
- **Service Layer**: All business logic in `services/`
- **Type Safety**: Pydantic models for request/response validation
- **Configuration Management**: Centralized config in `core/`
- **Error Handling**: Consistent error responses

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
NEXT_PUBLIC_AGORA_TOKEN=your_agora_token
```

### Backend (.env)
```
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net
DATABASE_NAME=loan_video
ENVIRONMENT=development
LOG_LEVEL=INFO
```

## Development Workflow

1. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev  # Runs on http://localhost:3000
   ```

2. **Backend**:
   ```bash
   cd backend
   source .venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload
   ```

## Code Quality Standards

- **Linting**: ESLint (frontend), pylint/flake8 (backend)
- **Type Checking**: TypeScript (frontend), mypy (backend)
- **Testing**: Jest (frontend), pytest (backend)
- **Formatting**: Prettier (frontend), black (backend)

## Deployment Architecture

- **Frontend**: Vercel or Netlify
- **Backend**: Docker container on AWS ECS or GCP Cloud Run
- **Database**: MongoDB Atlas
- **Storage**: AWS S3 for video files
- **CDN**: Cloudflare

---

Last Updated: April 18, 2026
