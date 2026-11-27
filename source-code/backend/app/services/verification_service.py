"""Conflict detection and human verification service."""
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.extraction import ExtractedMetric
from app.models.verification import Conflict, ConflictEvidence, VerificationRecord


def detect_conflicts_for_document(db: Session, document_id: str) -> int:
    """Compare extracted metrics in this document against other documents for the same mine/metric/period."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return 0

    doc_metrics = (
        db.query(ExtractedMetric)
        .filter(ExtractedMetric.document_id == document_id, ExtractedMetric.normalized_value.isnot(None))
        .all()
    )

    created = 0
    for m in doc_metrics:
        mine = m.mine_name or doc.mine_name
        period = m.reporting_period or doc.reporting_year
        if not mine:
            continue

        others = (
            db.query(ExtractedMetric)
            .join(Document, ExtractedMetric.document_id == Document.id)
            .filter(
                ExtractedMetric.document_id != document_id,
                ExtractedMetric.metric_name == m.metric_name,
                ExtractedMetric.normalized_value.isnot(None),
                Document.is_deleted == False,
                (ExtractedMetric.mine_name == mine) | (Document.mine_name == mine),
            )
            .all()
        )

        for other in others:
            other_period = other.reporting_period or ""
            if period and other_period and period != other_period:
                continue

            if abs(other.normalized_value - m.normalized_value) > 0.01:
                existing = (
                    db.query(Conflict)
                    .filter(
                        Conflict.metric_name == m.metric_name,
                        Conflict.mine_name == mine,
                        Conflict.status == "open",
                    )
                    .first()
                )
                if existing:
                    continue

                conflict = Conflict(
                    conflict_type="metric_mismatch",
                    metric_name=m.metric_name,
                    mine_name=mine,
                    reporting_year=period,
                    status="open",
                    severity="high",
                    description=(
                        f"{m.metric_name} discrepancy for {mine}: "
                        f"{m.original_value} {m.unit} vs {other.original_value} {other.unit}"
                    ),
                )
                db.add(conflict)
                db.flush()

                db.add(ConflictEvidence(
                    conflict_id=conflict.id,
                    metric_id=m.id,
                    document_id=m.document_id,
                    page_number=m.page_number,
                    extracted_value=m.original_value,
                    unit=m.unit,
                    supporting_text=m.supporting_text,
                ))
                db.add(ConflictEvidence(
                    conflict_id=conflict.id,
                    metric_id=other.id,
                    document_id=other.document_id,
                    page_number=other.page_number,
                    extracted_value=other.original_value,
                    unit=other.unit,
                    supporting_text=other.supporting_text,
                ))
                created += 1

    return created


def verify_metric(
    db: Session,
    metric_id: str,
    user_id: str,
    decision: str,
    comment: str = "",
    new_value: str = "",
) -> ExtractedMetric:
    """Record human verification decision on an extracted metric."""
    metric = db.query(ExtractedMetric).filter(ExtractedMetric.id == metric_id).first()
    if not metric:
        raise ValueError("Metric not found")

    prev_val = metric.original_value
    metric.verification_status = decision
    if decision == "corrected" and new_value:
        metric.original_value = new_value
        try:
            metric.normalized_value = float(new_value.replace(",", ""))
        except ValueError:
            pass

    db.add(VerificationRecord(
        metric_id=metric.id,
        verified_by=user_id,
        decision=decision,
        comment=comment,
        previous_value=prev_val,
        new_value=new_value or prev_val,
    ))
    db.commit()
    db.refresh(metric)
    return metric


def resolve_conflict(db: Session, conflict_id: str, user_id: str, status: str = "resolved") -> Conflict:
    conflict = db.query(Conflict).filter(Conflict.id == conflict_id).first()
    if not conflict:
        raise ValueError("Conflict not found")
    conflict.status = status
    conflict.resolved_by = user_id
    conflict.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(conflict)
    return conflict
