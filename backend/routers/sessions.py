"""
Session, Consent, and Language router.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Session as MKSession, Consent, Patient, User
from schemas import SessionCreate, SessionOut, ConsentCreate, ConsentOut, MessageResponse
from core.dependencies import get_current_user
from core.audit import log_action

router = APIRouter(tags=["sessions"])


# ─── Sessions ───────────────────────────────────────────────────────────────

session_router = APIRouter(prefix="/api/sessions")


@session_router.post("", response_model=SessionOut)
async def create_session(
    payload: SessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = MKSession(
        patient_id=payload.patient_id,
        language_code=payload.language_code,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    await log_action(db, "create_session", user_id=current_user.id,
                     resource_type="session", resource_id=session.id)
    return SessionOut.model_validate(session)


@session_router.get("/{session_id}", response_model=SessionOut)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(MKSession).where(MKSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionOut.model_validate(session)


@session_router.post("/{session_id}/complete", response_model=MessageResponse)
async def complete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(MKSession).where(MKSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.status = "completed"
    session.completed_at = datetime.now(timezone.utc)
    await db.commit()
    await log_action(db, "complete_session", user_id=current_user.id,
                     resource_type="session", resource_id=session_id)
    return {"message": "Session completed"}


# ─── Consent ────────────────────────────────────────────────────────────────

consent_router = APIRouter(prefix="/api/consents")


@consent_router.post("", response_model=ConsentOut)
async def record_consent(
    payload: ConsentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ensure session exists
    result = await db.execute(select(MKSession).where(MKSession.id == payload.session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Prevent duplicate consent
    existing = await db.execute(select(Consent).where(Consent.session_id == payload.session_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Consent already recorded for this session")

    consent = Consent(session_id=payload.session_id, given=payload.given)
    db.add(consent)
    await db.commit()
    await db.refresh(consent)

    await log_action(
        db, "consent_given" if payload.given else "consent_declined",
        user_id=current_user.id, resource_type="consent",
        resource_id=consent.id,
        details={"given": payload.given},
    )
    return ConsentOut.model_validate(consent)


@consent_router.get("/{session_id}", response_model=ConsentOut)
async def get_consent(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Consent).where(Consent.session_id == session_id))
    consent = result.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    return ConsentOut.model_validate(consent)
