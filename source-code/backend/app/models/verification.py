"""Verification, conflict, and conflict evidence models."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def _uuid():
    return str(uuid.uuid4())

def _now():
    return datetime.now(timezone.utc)


class Conflict(Base):
    __tablename__ = "conflicts"
    id = Column(String, primary_key=True, default=_uuid)
    conflict_type = Column(String(100), default="metric_mismatch")
    metric_name = Column(String(255), nullable=False)
    mine_name = Column(String(255), default="")
    reporting_year = Column(String(50), default="")
    status = Column(String(50), default="open")  # open | under_review | resolved | dismissed
    severity = Column(String(50), default="medium")  # low | medium | high | critical
    description = Column(Text, default="")
    resolved_by = Column(String, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_now)

    evidence = relationship("ConflictEvidence", back_populates="conflict", cascade="all, delete-orphan")


class ConflictEvidence(Base):
    __tablename__ = "conflict_evidence"
    id = Column(String, primary_key=True, default=_uuid)
    conflict_id = Column(String, ForeignKey("conflicts.id", ondelete="CASCADE"), nullable=False)
    metric_id = Column(String, ForeignKey("extracted_metrics.id"), nullable=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=True)
    extracted_value = Column(String(255), default="")
    unit = Column(String(100), default="")
    supporting_text = Column(Text, default="")
    created_at = Column(DateTime, default=_now)

    conflict = relationship("Conflict", back_populates="evidence")


class VerificationRecord(Base):
    __tablename__ = "verification_records"
    id = Column(String, primary_key=True, default=_uuid)
    metric_id = Column(String, ForeignKey("extracted_metrics.id"), nullable=True)
    entity_id = Column(String, ForeignKey("extracted_entities.id"), nullable=True)
    verified_by = Column(String, ForeignKey("users.id"), nullable=False)
    decision = Column(String(50), nullable=False)  # verified | rejected | corrected
    comment = Column(Text, default="")
    previous_value = Column(String(500), default="")
    new_value = Column(String(500), default="")
    created_at = Column(DateTime, default=_now)
