"""
Admin router — user management, audit logs, question bank management.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from database import get_db
from models import User, AuditLog
from schemas import UserManageCreate, UserOut, AuditLogOut, MessageResponse
from core.dependencies import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=List[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    role: str = Query(None),
    skip: int = 0,
    limit: int = 50,
):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    result = await db.execute(query.offset(skip).limit(limit))
    users = result.scalars().all()
    return [UserOut.model_validate(u) for u in users]


@router.post("/users", response_model=UserOut)
async def create_user(
    payload: UserManageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    existing = await db.execute(select(User).where(User.mobile == payload.mobile))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User with this mobile already exists")

    user = User(
        mobile=payload.mobile,
        full_name=payload.full_name,
        role=payload.role,
        email=payload.email,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.put("/users/{user_id}/deactivate", response_model=MessageResponse)
async def deactivate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    await db.commit()
    return {"message": "User deactivated"}


@router.get("/audit-logs", response_model=List[AuditLogOut])
async def get_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 100,
):
    result = await db.execute(
        select(AuditLog).order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit)
    )
    logs = result.scalars().all()
    return [AuditLogOut.model_validate(log) for log in logs]


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Dashboard statistics for admin."""
    from sqlalchemy import func
    from models import Session as MKSession, Document, RedFlag

    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_sessions = (await db.execute(select(func.count(MKSession.id)))).scalar()
    total_docs = (await db.execute(select(func.count(Document.id)))).scalar()
    total_red_flags = (await db.execute(select(func.count(RedFlag.id)))).scalar()
    high_priority = (
        await db.execute(
            select(func.count(MKSession.id)).where(MKSession.priority == "high")
        )
    ).scalar()

    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "total_documents": total_docs,
        "total_red_flags": total_red_flags,
        "high_priority_sessions": high_priority,
    }
