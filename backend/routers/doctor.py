"""
Doctor dashboard router — patient queue, verification, notes.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from models import (
    Session as MKSession, Patient, User, RedFlag as RedFlagModel,
    ClinicalSummary, DoctorVerification, Doctor
)
from schemas import (
    PatientQueueItem, DoctorVerificationCreate,
    ClinicalSummaryOut, MessageResponse,
)
from core.dependencies import get_current_doctor, get_current_user
from core.audit import log_action

router = APIRouter(prefix="/api/doctor", tags=["doctor"])


@router.get("/queue", response_model=List[PatientQueueItem])
async def get_patient_queue(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor),
):
    """Get the doctor's patient queue, sorted by priority."""
    # Get all active/completed sessions
    sessions_result = await db.execute(
        select(MKSession, Patient, User)
        .join(Patient, Patient.id == MKSession.patient_id)
        .join(User, User.id == Patient.user_id)
        .where(MKSession.status.in_(["active", "completed"]))
        .order_by(
            # Priority ordering: high > medium > normal
            MKSession.priority.desc(),
            MKSession.started_at.asc(),
        )
    )
    rows = sessions_result.fetchall()

    queue_items = []
    for session, patient, user in rows:
        # Count red flags
        rf_count_result = await db.execute(
            select(func.count(RedFlagModel.id)).where(RedFlagModel.session_id == session.id)
        )
        rf_count = rf_count_result.scalar() or 0

        queue_items.append(PatientQueueItem(
            patient_id=patient.id,
            session_id=session.id,
            patient_name=user.full_name or "Unknown",
            age=patient.age,
            gender=patient.gender,
            chief_complaint=session.chief_complaint,
            priority=session.priority,
            status=session.status,
            started_at=session.started_at,
            red_flag_count=rf_count,
            language_code=session.language_code,
        ))

    return queue_items


@router.get("/patients/{patient_id}")
async def get_patient_detail(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor),
):
    """Get full patient detail for doctor view."""
    result = await db.execute(
        select(Patient, User)
        .join(User, User.id == Patient.user_id)
        .where(Patient.id == patient_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient, user = row

    # Latest session
    session_result = await db.execute(
        select(MKSession)
        .where(MKSession.patient_id == patient_id)
        .order_by(MKSession.started_at.desc())
        .limit(1)
    )
    session = session_result.scalar_one_or_none()

    return {
        "patient": {
            "id": patient.id,
            "name": user.full_name,
            "mobile": user.mobile,
            "age": patient.age,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "known_allergies": patient.known_allergies or [],
            "chronic_conditions": patient.chronic_conditions or [],
        },
        "latest_session": {
            "id": session.id if session else None,
            "status": session.status if session else None,
            "priority": session.priority if session else None,
            "language_code": session.language_code if session else None,
            "chief_complaint": session.chief_complaint if session else None,
            "started_at": session.started_at.isoformat() if session else None,
        } if session else None,
    }


@router.post("/verify/{summary_id}", response_model=MessageResponse)
async def verify_summary(
    summary_id: str,
    payload: DoctorVerificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_doctor),
):
    """Record doctor verification action on a summary."""
    summary_result = await db.execute(
        select(ClinicalSummary).where(ClinicalSummary.id == summary_id)
    )
    summary = summary_result.scalar_one_or_none()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")

    # Get doctor record
    doctor_result = await db.execute(
        select(Doctor).where(Doctor.user_id == current_user.id)
    )
    doctor = doctor_result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    verification = DoctorVerification(
        summary_id=summary_id,
        doctor_id=doctor.id,
        action=payload.action,
        field_name=payload.field_name,
        old_value=payload.old_value,
        new_value=payload.new_value,
        notes=payload.notes,
    )
    db.add(verification)

    if payload.action == "verified":
        summary.is_verified = True

    await db.commit()
    await log_action(
        db, f"doctor_{payload.action}", user_id=current_user.id,
        resource_type="summary", resource_id=summary_id,
        details={"action": payload.action, "field": payload.field_name},
    )
    return {"message": f"Summary {payload.action} successfully"}
