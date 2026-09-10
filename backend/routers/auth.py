"""
Authentication router — login, OTP, demo login.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, OTPRecord, Patient, Doctor
from schemas import (
    LoginRequest, VerifyOTPRequest, DemoLoginRequest,
    TokenResponse, MessageResponse,
)
from core.security import create_access_token, generate_otp, otp_expires_at
from core.audit import log_action

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/send-otp", response_model=MessageResponse)
async def send_otp(request: LoginRequest, req: Request, db: AsyncSession = Depends(get_db)):
    """Send OTP to the patient's mobile number."""
    # Ensure user exists or create one
    result = await db.execute(select(User).where(User.mobile == request.mobile))
    user = result.scalar_one_or_none()
    if not user:
        user = User(mobile=request.mobile, role="patient")
        db.add(user)
        await db.flush()
        patient = Patient(user_id=user.id)
        db.add(patient)

    # Generate OTP
    otp_code = generate_otp()
    otp_record = OTPRecord(
        mobile=request.mobile,
        otp_code=otp_code,
        expires_at=otp_expires_at(),
    )
    db.add(otp_record)
    await db.commit()

    # In production, send via SMS gateway.
    # For demo, return OTP in response (dev only).
    await log_action(
        db, "send_otp", user_id=user.id,
        resource_type="otp", details={"mobile": request.mobile},
        ip_address=req.client.host if req.client else None,
    )

    # DEMO: Expose OTP in non-production
    from config import settings
    if settings.ENV == "development":
        return {"message": f"OTP sent to {request.mobile}. [DEV] OTP is: {otp_code}"}
    return {"message": f"OTP sent to {request.mobile}"}


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(payload: VerifyOTPRequest, req: Request, db: AsyncSession = Depends(get_db)):
    """Verify OTP and return JWT."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(OTPRecord).where(
            OTPRecord.mobile == payload.mobile,
            OTPRecord.otp_code == payload.otp,
            OTPRecord.used == False,
            OTPRecord.expires_at > now,
        ).order_by(OTPRecord.created_at.desc()).limit(1)
    )
    otp_record = result.scalar_one_or_none()
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    otp_record.used = True

    result2 = await db.execute(select(User).where(User.mobile == payload.mobile))
    user = result2.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = create_access_token({"sub": user.id, "role": user.role})
    await db.commit()

    await log_action(db, "login", user_id=user.id, resource_type="auth",
                     ip_address=req.client.host if req.client else None)

    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        name=user.full_name,
    )


@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(payload: DemoLoginRequest, req: Request, db: AsyncSession = Depends(get_db)):
    """Demo login for hackathon demonstration without OTP."""
    demo_accounts = {
        "patient": {"mobile": "9999900001", "name": "Demo Patient"},
        "doctor": {"mobile": "9999900002", "name": "Dr. Demo Doctor"},
        "nurse": {"mobile": "9999900003", "name": "Demo Nurse"},
        "admin": {"mobile": "9999900004", "name": "Demo Admin"},
    }
    account = demo_accounts.get(payload.role)
    if not account:
        raise HTTPException(status_code=400, detail="Invalid role for demo login")

    result = await db.execute(select(User).where(User.mobile == account["mobile"]))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            mobile=account["mobile"],
            full_name=account["name"],
            role=payload.role,
            is_demo=True,
        )
        db.add(user)
        await db.flush()

        if payload.role == "patient":
            patient = Patient(user_id=user.id, age=35, gender="male")
            db.add(patient)
        elif payload.role == "doctor":
            doctor = Doctor(user_id=user.id, specialization="General Medicine", department="OPD")
            db.add(doctor)
        await db.commit()

    token = create_access_token({"sub": user.id, "role": user.role})
    await log_action(db, "demo_login", user_id=user.id, resource_type="auth",
                     ip_address=req.client.host if req.client else None)

    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        name=user.full_name,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(db: AsyncSession = Depends(get_db)):
    # JWT is stateless; client discards token.
    return {"message": "Logged out successfully"}
