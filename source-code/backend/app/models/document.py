"""Document, DocumentPage, and DocumentMetadata models."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


def _uuid():
    return str(uuid.uuid4())

def _now():
    return datetime.now(timezone.utc)


class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, default=_uuid)
    title = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    storage_key = Column(String(255), unique=True, nullable=False)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(100), default="")
    category = Column(String(100), default="Uncategorized")
    subsidiary = Column(String(255), default="")
    mine_name = Column(String(255), default="")
    reporting_year = Column(String(20), default="")
    classification = Column(String(50), default="Internal")
    processing_status = Column(String(50), default="pending")  # pending | processing | completed | failed
    page_count = Column(Integer, default=0)
    uploaded_by = Column(String, ForeignKey("users.id"), nullable=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)

    uploader = relationship("User", back_populates="documents")
    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    metadata_entries = relationship("DocumentMetadata", back_populates="document", cascade="all, delete-orphan")
    processing_jobs = relationship("ProcessingJob", back_populates="document", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    entities = relationship("ExtractedEntity", back_populates="document", cascade="all, delete-orphan")
    metrics = relationship("ExtractedMetric", back_populates="document", cascade="all, delete-orphan")


class DocumentPage(Base):
    __tablename__ = "document_pages"
    id = Column(String, primary_key=True, default=_uuid)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=False)
    text_content = Column(Text, default="")
    ocr_confidence = Column(Float, nullable=True)
    extraction_method = Column(String(50), default="digital")  # digital | ocr | hybrid
    has_tables = Column(Boolean, default=False)
    table_data = Column(Text, default="")  # JSON-serialized table data
    created_at = Column(DateTime, default=_now)

    document = relationship("Document", back_populates="pages")


class DocumentMetadata(Base):
    __tablename__ = "document_metadata"
    id = Column(String, primary_key=True, default=_uuid)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    key = Column(String(255), nullable=False)
    value = Column(Text, default="")
    source = Column(String(50), default="extracted")  # extracted | manual | ai
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=_now)

    document = relationship("Document", back_populates="metadata_entries")
