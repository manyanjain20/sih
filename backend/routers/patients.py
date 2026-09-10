"""
Patients router.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Patient, User
from schemas import PatientCreate, PatientOut, PatientUpdate
from core.dependencies import get_current_user

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.post("", response_model=PatientOut)
async def create_patient(payload: PatientCreate, db: AsyncSession = Depends(get_db)):
    # Create user + patient
    user = User(mobile=payload.mobile, full_name=payload.full_name, role="patient")
    db.add(user)
    await db.flush()
    patient = Patient(
        user_id=user.id,
        age=payload.age,
        gender=payload.gender,
        blood_group=payload.blood_group,
        address=payload.address,
        emergency_contact=payload.emergency_contact,
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    result = PatientOut(
        id=patient.id,
        user_id=patient.user_id,
        age=patient.age,
        gender=patient.gender,
        blood_group=patient.blood_group,
        full_name=user.full_name,
        mobile=user.mobile,
        known_allergies=patient.known_allergies or [],
        chronic_conditions=patient.chronic_conditions or [],
    )
    return result


@router.get("/{patient_id}", response_model=PatientOut)
async def get_patient(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Patient, User)
        .join(User, User.id == Patient.user_id)
        .where(Patient.id == patient_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient, user = row
    return PatientOut(
        id=patient.id,
        user_id=patient.user_id,
        age=patient.age,
        gender=patient.gender,
        blood_group=patient.blood_group,
        full_name=user.full_name,
        mobile=user.mobile,
        known_allergies=patient.known_allergies or [],
        chronic_conditions=patient.chronic_conditions or [],
    )


@router.put("/{patient_id}", response_model=PatientOut)
async def update_patient(
    patient_id: str,
    payload: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Patient, User)
        .join(User, User.id == Patient.user_id)
        .where(Patient.id == patient_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient, user = row

    update_data = payload.model_dump(exclude_none=True)
    if "full_name" in update_data:
        user.full_name = update_data.pop("full_name")
    for k, v in update_data.items():
        setattr(patient, k, v)

    await db.commit()
    await db.refresh(patient)
    return PatientOut(
        id=patient.id,
        user_id=patient.user_id,
        age=patient.age,
        gender=patient.gender,
        blood_group=patient.blood_group,
        full_name=user.full_name,
        mobile=user.mobile,
        known_allergies=patient.known_allergies or [],
        chronic_conditions=patient.chronic_conditions or [],
    )
