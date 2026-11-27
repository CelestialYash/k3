"""Document upload, listing, preview, download, processing, and deletion routes."""
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload

from app.config import ALLOWED_EXTENSIONS, DOCUMENTS_DIR, MAX_UPLOAD_SIZE_MB
from app.database import get_db
from app.dependencies import get_current_user
from app.models.document import Document, DocumentPage
from app.models.extraction import ExtractedEntity, ExtractedMetric
from app.models.processing import ProcessingJob
from app.models.user import User
from app.schemas import DocumentPageResponse, DocumentResponse, EntityResponse, MetricResponse
from app.security.rbac import has_role
from app.services.audit_service import record_audit
from app.services.processing_service import process_document

router = APIRouter(prefix="/documents", tags=["Documents"])


def _can_access_document(user: User, doc: Document) -> bool:
    if doc.is_deleted:
        return False
    if has_role(user, "admin"):
        return True
    if doc.classification == "Restricted" and doc.uploaded_by != user.id:
        return False
    return True


def _to_doc_response(d: Document) -> DocumentResponse:
    return DocumentResponse(
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


@router.get("", response_model=List[DocumentResponse])
def list_documents(
    category: Optional[str] = None,
    subsidiary: Optional[str] = None,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Document).options(joinedload(Document.uploader)).filter(Document.is_deleted == False)
    if not has_role(current_user, "admin"):
        q = q.filter((Document.classification != "Restricted") | (Document.uploaded_by == current_user.id))
    if category:
        q = q.filter(Document.category == category)
    if subsidiary:
        q = q.filter(Document.subsidiary == subsidiary)
    if status_filter:
        q = q.filter(Document.processing_status == status_filter)
    if search:
        like = f"%{search}%"
        q = q.filter(
            Document.title.ilike(like)
            | Document.mine_name.ilike(like)
            | Document.original_filename.ilike(like)
        )
    docs = q.order_by(Document.created_at.desc()).all()
    return [_to_doc_response(d) for d in docs]


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(""),
    category: str = Form("Geological Reports"),
    subsidiary: str = Form(""),
    mine_name: str = Form(""),
    reporting_year: str = Form(""),
    classification: str = Form("Internal"),
    auto_process: bool = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not has_role(current_user, "researcher"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Researcher or higher role required to upload")

    orig_name = file.filename or "document.pdf"
    ext = Path(orig_name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type {ext}. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds size limit")

    storage_key = f"{uuid.uuid4().hex}{ext}"
    dest = DOCUMENTS_DIR / storage_key
    dest.write_bytes(content)

    doc = Document(
        title=title.strip() or Path(orig_name).stem,
        original_filename=orig_name,
        storage_key=storage_key,
        file_size=len(content),
        mime_type=file.content_type or "application/octet-stream",
        category=category,
        subsidiary=subsidiary,
        mine_name=mine_name,
        reporting_year=reporting_year,
        classification=classification,
        uploaded_by=current_user.id,
        processing_status="pending",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    record_audit(
        db,
        action="DOCUMENT_UPLOADED",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="document",
        resource_id=doc.id,
        details=f"Uploaded '{doc.title}' ({orig_name}, {len(content)} bytes)",
    )

    if auto_process:
        try:
            process_document(db, doc.id)
        except Exception:
            pass
        db.refresh(doc)

    doc = db.query(Document).options(joinedload(Document.uploader)).filter(Document.id == doc.id).first()
    return _to_doc_response(doc)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).options(joinedload(Document.uploader)).filter(Document.id == document_id).first()
    if not doc or not _can_access_document(current_user, doc):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or access denied")
    return _to_doc_response(doc)


@router.post("/{document_id}/process")
def trigger_processing(document_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not has_role(current_user, "researcher"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Researcher role required")
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not _can_access_document(current_user, doc):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    job = process_document(db, document_id)
    record_audit(
        db,
        action="DOCUMENT_PROCESSED",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="document",
        resource_id=doc.id,
        details=f"Processed document with status {job.status}",
    )
    return {"job_id": job.id, "status": job.status, "summary": job.result_summary}


@router.get("/{document_id}/pages", response_model=List[DocumentPageResponse])
def get_document_pages(document_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not _can_access_document(current_user, doc):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or access denied")
    return (
        db.query(DocumentPage)
        .filter(DocumentPage.document_id == document_id)
        .order_by(DocumentPage.page_number.asc())
        .all()
    )


@router.get("/{document_id}/entities", response_model=List[EntityResponse])
def get_document_entities(document_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not _can_access_document(current_user, doc):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return db.query(ExtractedEntity).filter(ExtractedEntity.document_id == document_id).all()


@router.get("/{document_id}/metrics", response_model=List[MetricResponse])
def get_document_metrics(document_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not _can_access_document(current_user, doc):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return db.query(ExtractedMetric).filter(ExtractedMetric.document_id == document_id).all()


@router.get("/{document_id}/download")
def download_document(document_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not _can_access_document(current_user, doc):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or access denied")
    file_path = DOCUMENTS_DIR / doc.storage_key
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored file not found")
    record_audit(
        db,
        action="DOCUMENT_DOWNLOADED",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="document",
        resource_id=doc.id,
        details=f"Downloaded '{doc.original_filename}'",
    )
    return FileResponse(path=str(file_path), filename=doc.original_filename, media_type=doc.mime_type)


@router.delete("/{document_id}")
def delete_document(document_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not has_role(current_user, "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required to delete documents")
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or doc.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    doc.is_deleted = True
    db.commit()
    record_audit(
        db,
        action="DOCUMENT_DELETED",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="document",
        resource_id=doc.id,
        details=f"Soft-deleted '{doc.title}'",
    )
    return {"message": "Document deleted"}


@router.get("/jobs/list")
def list_processing_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    jobs = (
        db.query(ProcessingJob, Document.title)
        .join(Document, ProcessingJob.document_id == Document.id)
        .filter(Document.is_deleted == False)
        .order_by(ProcessingJob.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": j.id,
            "document_id": j.document_id,
            "document_title": title,
            "job_type": j.job_type,
            "status": j.status,
            "started_at": j.started_at,
            "completed_at": j.completed_at,
            "error_message": j.error_message,
            "result_summary": j.result_summary,
        }
        for j, title in jobs
    ]
