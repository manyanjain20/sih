"""
Medical timeline router.
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import MedicalTimeline, User
from schemas import TimelineEventOut
from core.dependencies import get_current_user

router = APIRouter(prefix="/api/timeline", tags=["timeline"])


@router.get("/{patient_id}", response_model=List[TimelineEventOut])
async def get_timeline(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the full medical timeline for a patient, sorted by date."""
    result = await db.execute(
        select(MedicalTimeline)
        .where(MedicalTimeline.patient_id == patient_id)
        .order_by(MedicalTimeline.event_year.asc(), MedicalTimeline.event_date.asc())
    )
    events = result.scalars().all()
    return [TimelineEventOut.model_validate(e) for e in events]
