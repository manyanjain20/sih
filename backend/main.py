"""
MediKiosk FastAPI Application — Main Entry Point

AI-Powered Patient Case-Taking & Medical Document Digitization Platform
Smart India Hackathon 2026 | Problem Statement 26047
Team: EightBit
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from config import settings
from database import init_db


# ─── Lifespan ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    
    # Ensure upload directory exists
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    
    # Seed demo data
    from services.seed import seed_demo_data
    await seed_demo_data()
    
    yield
    # Shutdown (cleanup if needed)


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="MediKiosk API",
    description="""
    ## MediKiosk — AI-Powered Patient Case-Taking Platform
    
    **Smart India Hackathon 2026 | Problem Statement 26047**  
    **Team: EightBit**
    
    ### Features
    - Patient authentication (OTP / Demo)
    - Multilingual adaptive clinical questioning
    - SOCRATES symptom assessment  
    - AYUSH Dashavidha Pariksha
    - Medical document OCR & clinical entity extraction
    - Rule-based red flag detection
    - Structured physician summary generation
    - Doctor dashboard with verification workflow
    
    ### Safety Notice
    MediKiosk is an **assistive clinical information system**.
    It does **not** independently diagnose diseases or prescribe treatment.
    All AI-generated content requires physician verification.
    """,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)


# ─── Middleware ───────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Routers ──────────────────────────────────────────────────────────────────

from routers.auth import router as auth_router
from routers.patients import router as patients_router
from routers.sessions import session_router, consent_router
from routers.conversation import router as conversation_router
from routers.voice import router as voice_router
from routers.assessments import socrates_router, dashavidha_router
from routers.documents import router as documents_router
from routers.ocr import router as ocr_router
from routers.timeline import router as timeline_router
from routers.redflags import router as redflags_router
from routers.summaries import router as summaries_router
from routers.doctor import router as doctor_router
from routers.admin import router as admin_router

app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(session_router)
app.include_router(consent_router)
app.include_router(conversation_router)
app.include_router(voice_router)
app.include_router(socrates_router)
app.include_router(dashavidha_router)
app.include_router(documents_router)
app.include_router(ocr_router)
app.include_router(timeline_router)
app.include_router(redflags_router)
app.include_router(summaries_router)
app.include_router(doctor_router)
app.include_router(admin_router)


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "env": settings.ENV,
        "ai_provider": settings.AI_PROVIDER,
        "safety_notice": "MediKiosk is an assistive system. AI output requires physician verification.",
    }


@app.get("/", tags=["health"])
async def root():
    return {
        "message": "MediKiosk API — Smart India Hackathon 2026",
        "docs": "/api/docs",
        "health": "/api/health",
    }
