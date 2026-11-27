"""Extracted entity and metric models."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def _uuid():
    return str(uuid.uuid4())

def _now():
    return datetime.now(timezone.utc)


class ExtractedEntity(Base):
    __tablename__ = "extracted_entities"
    id = Column(String, primary_key=True, default=_uuid)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=True)
    entity_type = Column(String(100), nullable=False)  # mine_name | subsidiary | location | date | year ...
    entity_value = Column(Text, nullable=False)
    original_text = Column(Text, default="")
    confidence = Column(Float, default=0.0)
    verification_status = Column(String(50), default="unverified")  # unverified | verified | rejected
    created_at = Column(DateTime, default=_now)

    document = relationship("Document", back_populates="entities")


class ExtractedMetric(Base):
    __tablename__ = "extracted_metrics"
    id = Column(String, primary_key=True, default=_uuid)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=True)
    metric_name = Column(String(255), nullable=False)
    original_value = Column(String(255), nullable=False)
    normalized_value = Column(Float, nullable=True)
    unit = Column(String(100), default="")
    reporting_period = Column(String(100), default="")
    mine_name = Column(String(255), default="")
    supporting_text = Column(Text, default="")
    confidence = Column(Float, default=0.0)
    verification_status = Column(String(50), default="unverified")
    created_at = Column(DateTime, default=_now)

    document = relationship("Document", back_populates="metrics")
