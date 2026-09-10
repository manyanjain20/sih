"""
Audit logging utility — record actions in AuditLog table.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from models import AuditLog
from typing import Optional


async def log_action(
    db: AsyncSession,
    action: str,
    user_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
    result: str = "success",
):
    entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
        ip_address=ip_address,
        result=result,
    )
    db.add(entry)
    await db.commit()
