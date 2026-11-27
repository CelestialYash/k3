"""Report generation and download routes."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import DOCUMENTS_DIR
from app.database import get_db
from app.dependencies import get_current_user
from app.models.report import GeneratedReport
from app.models.user import User
from app.schemas import GenerateReportRequest, ReportResponse
from app.security.rbac import has_role
from app.services.audit_service import record_audit
from app.services.report_service import generate_report

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=List[ReportResponse])
def list_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(GeneratedReport).order_by(GeneratedReport.created_at.desc()).limit(50).all()


@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: GenerateReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not has_role(current_user, "analyst"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Analyst or higher role required")

    report = generate_report(
        db=db,
        user_id=current_user.id,
        title=payload.title,
        report_type=payload.report_type,
        fmt=payload.format,
        parameters=payload.parameters,
    )
    record_audit(
        db,
        action="REPORT_GENERATED",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="report",
        resource_id=report.id,
        details=f"Generated {payload.format.upper()} report '{payload.title}'",
    )
    return report


@router.get("/{report_id}/download")
def download_report(report_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(GeneratedReport).filter(GeneratedReport.id == report_id).first()
    if not report or not report.storage_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    path = DOCUMENTS_DIR / report.storage_key
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report file missing")
    return FileResponse(path=str(path), filename=f"{report.title}.{report.format}")
