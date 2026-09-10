"""
SOCRATES and Dashavidha assessment routers.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import SocratesAssessment, DashavidhaAssessment, User
from schemas import (
    SocratesCreate, SocratesOut,
    DashavidhaCreate, DashavidhaOut,
    MessageResponse,
)
from core.dependencies import get_current_user

socrates_router = APIRouter(prefix="/api/socrates", tags=["socrates"])
dashavidha_router = APIRouter(prefix="/api/dashavidha", tags=["dashavidha"])


# ─── SOCRATES ────────────────────────────────────────────────────────────────

@socrates_router.post("", response_model=SocratesOut)
async def upsert_socrates(
    payload: SocratesCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SocratesAssessment).where(SocratesAssessment.session_id == payload.session_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        for k, v in payload.model_dump(exclude={"session_id"}).items():
            if v is not None:
                setattr(existing, k, v)
        await db.commit()
        await db.refresh(existing)
        return SocratesOut.model_validate(existing)
    else:
        assessment = SocratesAssessment(**payload.model_dump())
        db.add(assessment)
        await db.commit()
        await db.refresh(assessment)
        return SocratesOut.model_validate(assessment)


@socrates_router.get("/{session_id}", response_model=SocratesOut)
async def get_socrates(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SocratesAssessment).where(SocratesAssessment.session_id == session_id)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="SOCRATES assessment not found")
    return SocratesOut.model_validate(assessment)


# ─── Dashavidha ─────────────────────────────────────────────────────────────

@dashavidha_router.post("", response_model=DashavidhaOut)
async def upsert_dashavidha(
    payload: DashavidhaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DashavidhaAssessment).where(DashavidhaAssessment.session_id == payload.session_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        for k, v in payload.model_dump(exclude={"session_id"}).items():
            if v is not None:
                setattr(existing, k, v)
        await db.commit()
        await db.refresh(existing)
        return DashavidhaOut.model_validate(existing)
    else:
        assessment = DashavidhaAssessment(**payload.model_dump())
        db.add(assessment)
        await db.commit()
        await db.refresh(assessment)
        return DashavidhaOut.model_validate(assessment)


@dashavidha_router.get("/{session_id}", response_model=DashavidhaOut)
async def get_dashavidha(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DashavidhaAssessment).where(DashavidhaAssessment.session_id == session_id)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Dashavidha assessment not found")
    return DashavidhaOut.model_validate(assessment)
