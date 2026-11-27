"""Pydantic schemas for API request/response validation."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# ---- Auth ----
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    designation: str
    subsidiary: str
    location: str
    is_active: bool
    roles: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

class CreateUserRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    full_name: str
    designation: str = ""
    subsidiary: str = ""
    location: str = ""
    role: str = "viewer"

class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    designation: Optional[str] = None
    subsidiary: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None


# ---- Documents ----
class DocumentResponse(BaseModel):
    id: str
    title: str
    original_filename: str
    file_size: int
    mime_type: str
    category: str
    subsidiary: str
    mine_name: str
    reporting_year: str
    classification: str
    processing_status: str
    page_count: int
    uploaded_by: str
    uploader_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentUploadMeta(BaseModel):
    title: str = ""
    category: str = "Uncategorized"
    subsidiary: str = ""
    mine_name: str = ""
    reporting_year: str = ""
    classification: str = "Internal"


class DocumentPageResponse(BaseModel):
    id: str
    page_number: int
    text_content: str
    ocr_confidence: Optional[float] = None
    extraction_method: str
    has_tables: bool

    class Config:
        from_attributes = True


# ---- Extraction ----
class EntityResponse(BaseModel):
    id: str
    document_id: str
    page_number: Optional[int]
    entity_type: str
    entity_value: str
    original_text: str
    confidence: float
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class MetricResponse(BaseModel):
    id: str
    document_id: str
    page_number: Optional[int]
    metric_name: str
    original_value: str
    normalized_value: Optional[float]
    unit: str
    reporting_period: str
    mine_name: str
    supporting_text: str
    confidence: float
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---- AI Assistant ----
class AskQuestionRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None
    search_scope: str = "all"

class CitationResponse(BaseModel):
    document_id: str
    document_title: str
    page_number: Optional[int]
    excerpt: str
    relevance_score: float

class AIAnswerResponse(BaseModel):
    answer: str
    conversation_id: str
    citations: List[CitationResponse]
    confidence: float
    evidence_sufficient: bool


# ---- Verification ----
class ConflictResponse(BaseModel):
    id: str
    conflict_type: str
    metric_name: str
    mine_name: str
    reporting_year: str
    status: str
    severity: str
    description: str
    evidence: List[dict]
    created_at: datetime

    class Config:
        from_attributes = True

class VerifyRequest(BaseModel):
    decision: str  # verified | rejected | corrected
    comment: str = ""
    new_value: str = ""


# ---- Reports ----
class GenerateReportRequest(BaseModel):
    title: str
    report_type: str = "summary"
    format: str = "pdf"
    parameters: dict = {}

class ReportResponse(BaseModel):
    id: str
    title: str
    report_type: str
    format: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Analytics ----
class DashboardStats(BaseModel):
    total_documents: int
    processed_documents: int
    pending_verification: int
    total_conflicts: int
    open_conflicts: int
    total_entities: int
    total_metrics: int
    total_users: int
    recent_documents: List[DocumentResponse]
    processing_rate: float
    category_breakdown: dict


# ---- Audit ----
class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str]
    user_email: str
    action: str
    resource_type: str
    resource_id: str
    details: str
    ip_address: str
    created_at: datetime

    class Config:
        from_attributes = True
