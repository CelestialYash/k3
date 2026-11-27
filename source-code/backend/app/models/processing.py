"""Processing job model."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def _uuid():
    return str(uuid.uuid4())

def _now():
    return datetime.now(timezone.utc)


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"
    id = Column(String, primary_key=True, default=_uuid)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    job_type = Column(String(50), default="full")  # full | ocr | extraction | embedding
    status = Column(String(50), default="queued")  # queued | processing | completed | failed
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, default="")
    result_summary = Column(Text, default="")  # JSON summary of results
    created_at = Column(DateTime, default=_now)

    document = relationship("Document", back_populates="processing_jobs")
