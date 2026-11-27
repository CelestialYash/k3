"""Verification and conflict resolution routes."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.document import Document
from app.models.extraction import ExtractedMetric
from app.models.user import User
from app.models.verification import Conflict
from app.schemas import ConflictResponse, MetricResponse, VerifyRequest
from app.security.rbac import has_role
from app.services.audit_service import record_audit
from app.services.verification_service import resolve_conflict, verify_metric

router = APIRouter(prefix="/verification", tags=["Verification"])


@router.get("/conflicts", response_model=List[ConflictResponse])
def list_conflicts(
    status_filter: str = "all",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Conflict).options(joinedload(Conflict.evidence))
    if status_filter != "all":
        q = q.filter(Conflict.status == status_filter)
    conflicts = q.order_by(Conflict.created_at.desc()).all()

    doc_ids = {ev.document_id for c in conflicts for ev in c.evidence}
    docs = {d.id: d.title for d in db.query(Document).filter(Document.id.in_(list(doc_ids))).all()} if doc_ids else {}

    return [
        ConflictResponse(
            id=c.id,
            conflict_type=c.conflict_type,
            metric_name=c.metric_name,
            mine_name=c.mine_name,
            reporting_year=c.reporting_year,
            status=c.status,
            severity=c.severity,
            description=c.description,
            evidence=[
                {
                    "id": ev.id,
                    "metric_id": ev.metric_id,
                    "document_id": ev.document_id,
                    "document_title": docs.get(ev.document_id, "Unknown Document"),
                    "page_number": ev.page_number,
                    "extracted_value": ev.extracted_value,
                    "unit": ev.unit,
                    "supporting_text": ev.supporting_text,
                }
                for ev in c.evidence
            ],
            created_at=c.created_at,
        )
        for c in conflicts
    ]


@router.get("/pending-metrics", response_model=List[MetricResponse])
def list_pending_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(ExtractedMetric)
        .filter(ExtractedMetric.verification_status == "unverified")
        .order_by(ExtractedMetric.confidence.asc())
        .limit(50)
        .all()
    )


@router.post("/metrics/{metric_id}/verify", response_model=MetricResponse)
def verify_metric_endpoint(
    metric_id: str,
    payload: VerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not has_role(current_user, "researcher"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Researcher or higher role required")
    try:
        metric = verify_metric(
            db,
            metric_id=metric_id,
            user_id=current_user.id,
            decision=payload.decision,
            comment=payload.comment,
            new_value=payload.new_value,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    record_audit(
        db,
        action="METRIC_VERIFIED",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="metric",
        resource_id=metric_id,
        details=f"Decision: {payload.decision} ({payload.comment})",
    )
    return metric


@router.post("/conflicts/{conflict_id}/resolve")
def resolve_conflict_endpoint(
    conflict_id: str,
    status_val: str = "resolved",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not has_role(current_user, "researcher"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Researcher or higher role required")
    try:
        conflict = resolve_conflict(db, conflict_id, current_user.id, status=status_val)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    record_audit(
        db,
        action="CONFLICT_RESOLVED",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="conflict",
        resource_id=conflict_id,
        details=f"Marked conflict as {status_val}",
    )
    return {"id": conflict.id, "status": conflict.status}
