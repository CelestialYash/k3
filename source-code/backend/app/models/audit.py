"""Audit log model (append-only)."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from app.database import Base


def _uuid():
    return str(uuid.uuid4())

def _now():
    return datetime.now(timezone.utc)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(255), default="")
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), default="")
    resource_id = Column(String, default="")
    details = Column(Text, default="")
    ip_address = Column(String(45), default="")
    created_at = Column(DateTime, default=_now)
