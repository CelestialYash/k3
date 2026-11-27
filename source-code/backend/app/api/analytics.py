"""Dashboard and analytics routes."""
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.document import Document
from app.models.extraction import ExtractedEntity, ExtractedMetric
from app.models.user import User
from app.models.verification import Conflict
from app.schemas import DashboardStats, DocumentResponse
from app.security.rbac import has_role

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    base_q = db.query(Document).filter(Document.is_deleted == False)
    if not has_role(current_user, "admin"):
        base_q = base_q.filter(
            (Document.classification != "Restricted") | (Document.uploaded_by == current_user.id)
        )

    total_docs = base_q.count()
    processed_docs = base_q.filter(Document.processing_status == "completed").count()
    pending_verif = db.query(ExtractedMetric).filter(ExtractedMetric.verification_status == "unverified").count()
    total_conflicts = db.query(Conflict).count()
    open_conflicts = db.query(Conflict).filter(Conflict.status == "open").count()
    total_entities = db.query(ExtractedEntity).count()
    total_metrics = db.query(ExtractedMetric).count()
    total_users = db.query(User).filter(User.is_active == True).count()

    recent_docs = (
        base_q.options(joinedload(Document.uploader))
        .order_by(Document.created_at.desc())
        .limit(8)
        .all()
    )

    cat_rows = (
        db.query(Document.category, func.count(Document.id))
        .filter(Document.is_deleted == False)
        .group_by(Document.category)
        .all()
    )
    category_breakdown = {cat: cnt for cat, cnt in cat_rows}
    rate = round((processed_docs / total_docs * 100.0), 1) if total_docs > 0 else 0.0

    return DashboardStats(
        total_documents=total_docs,
        processed_documents=processed_docs,
        pending_verification=pending_verif,
        total_conflicts=total_conflicts,
        open_conflicts=open_conflicts,
        total_entities=total_entities,
        total_metrics=total_metrics,
        total_users=total_users,
        recent_documents=[
            DocumentResponse(
                id=d.id,
                title=d.title,
                original_filename=d.original_filename,
                file_size=d.file_size,
                mime_type=d.mime_type,
                category=d.category,
                subsidiary=d.subsidiary,
                mine_name=d.mine_name,
                reporting_year=d.reporting_year,
                classification=d.classification,
                processing_status=d.processing_status,
                page_count=d.page_count,
                uploaded_by=d.uploaded_by,
                uploader_name=d.uploader.full_name if d.uploader else None,
                created_at=d.created_at,
            )
            for d in recent_docs
        ],
        processing_rate=rate,
        category_breakdown=category_breakdown,
    )
