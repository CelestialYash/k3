"""Generated report model."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from app.database import Base


def _uuid():
    return str(uuid.uuid4())

def _now():
    return datetime.now(timezone.utc)


class GeneratedReport(Base):
    __tablename__ = "generated_reports"
    id = Column(String, primary_key=True, default=_uuid)
    title = Column(String(500), nullable=False)
    report_type = Column(String(100), default="summary")  # summary | production | geological | custom
    format = Column(String(20), default="pdf")  # pdf | docx | xlsx
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="generating")  # generating | completed | failed
    storage_key = Column(String(255), nullable=True)
    parameters = Column(Text, default="{}")  # JSON
    created_at = Column(DateTime, default=_now)
