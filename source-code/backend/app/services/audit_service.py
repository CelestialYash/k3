"""Audit logging service (append-only)."""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditLog


def record_audit(
    db: Session,
    action: str,
    user_id: Optional[str] = None,
    user_email: str = "",
    resource_type: str = "",
    resource_id: str = "",
    details: str = "",
    ip_address: str = "",
) -> AuditLog:
    """Append an immutable audit log entry."""
    entry = AuditLog(
        user_id=user_id,
        user_email=user_email,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
