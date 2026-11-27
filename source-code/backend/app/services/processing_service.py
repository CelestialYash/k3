"""Document processing, text/table extraction, entity & metric extraction, and chunking."""
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any

import fitz  # PyMuPDF
import pdfplumber
from sqlalchemy.orm import Session

from app.config import DOCUMENTS_DIR, CHUNK_SIZE, CHUNK_OVERLAP
from app.models.document import Document, DocumentPage, DocumentMetadata
from app.models.extraction import ExtractedEntity, ExtractedMetric
from app.models.knowledge import DocumentChunk
from app.models.processing import ProcessingJob
from app.services.verification_service import detect_conflicts_for_document


SUBSIDIARIES = ["SECL", "CCL", "BCCL", "WCL", "NCL", "MCL", "ECL", "NEC", "CMPDI"]
MINE_PATTERNS = [
    r"\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?\s+(?:OCP|UG\s*Mine|Mega\s*Mine|Mine|Project|Colliery|Block))\b",
    r"\b(Gevra|Kusmunda|Dipka|North\s+Karanpura|Moonidih|Ashok|Amritdhara|Jharia|Raniganj|Talcher)\b",
]
METRIC_PATTERNS = [
    (
        "Coal Production",
        r"(?:coal\s+production|annual\s+production|output|peak\s+capacity)[^.\n]{0,60}?(\d[\d,]*\.?\d*)\s*(MTPA|MT|million\s+tonnes|tonnes|te)",
    ),
    (
        "Proved Coal Reserves",
        r"(?:proved\s+(?:coal\s+|geological\s+)?reserves|mineable\s+reserves)[^.\n]{0,60}?(\d[\d,]*\.?\d*)\s*(MT|million\s+tonnes|tonnes)",
    ),
    (
        "Stripping Ratio",
        r"(?:stripping\s+ratio)[^.\n]{0,50}?(?:1\s*:\s*)?(\d+\.?\d*)\s*(m³/te|m3/te|cum/te)?",
    ),
    (
        "Seam Thickness",
        r"(?:seam\s+thickness|thickness)[^.\n]{0,50}?(\d+\.?\d*)\s*(m|meters|metres)",
    ),
    (
        "Overburden",
        r"(?:overburden(?:\s+removal)?|OB\s+removal)[^.\n]{0,50}?(\d[\d,]*\.?\d*)\s*(M\.?\s*cum|Mcum|m³|million\s+cum)",
    ),
]


def _chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = max(0, end - overlap)
    return chunks


def _extract_from_pdf(file_path: Path) -> List[Dict[str, Any]]:
    pages_data: List[Dict[str, Any]] = []
    doc = fitz.open(str(file_path))
    try:
        plumber_doc = None
        try:
            plumber_doc = pdfplumber.open(str(file_path))
        except Exception:
            plumber_doc = None

        for idx, page in enumerate(doc):
            page_num = idx + 1
            text = page.get_text("text") or ""
            tables = []
            if plumber_doc and idx < len(plumber_doc.pages):
                try:
                    raw_tables = plumber_doc.pages[idx].extract_tables() or []
                    tables = [t for t in raw_tables if t]
                except Exception:
                    tables = []

            confidence = 0.95 if len(text.strip()) > 40 else 0.45
            method = "digital" if len(text.strip()) > 40 else "low_text_scan"
            pages_data.append({
                "page_number": page_num,
                "text_content": text.strip(),
                "ocr_confidence": confidence,
                "extraction_method": method,
                "has_tables": len(tables) > 0,
                "table_data": json.dumps(tables) if tables else "",
            })

        if plumber_doc:
            plumber_doc.close()
    finally:
        doc.close()
    return pages_data


def _extract_from_text_or_office(file_path: Path, ext: str) -> List[Dict[str, Any]]:
    text = ""
    tables = []
    method = "digital"
    confidence = 0.96

    if ext == ".csv":
        import csv
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            rows = list(csv.reader(f))
        tables = rows
        text = "\n".join([" | ".join(r) for r in rows])
    elif ext == ".xlsx":
        import openpyxl
        wb = openpyxl.load_workbook(str(file_path), data_only=True)
        parts = []
        for sheet in wb.sheetnames:
            ws = wb[sheet]
            rows = [[str(c) if c is not None else "" for c in row] for row in ws.iter_rows(values_only=True)]
            tables.extend(rows)
            parts.append(f"Sheet: {sheet}\n" + "\n".join(" | ".join(r) for r in rows))
        text = "\n\n".join(parts)
    elif ext == ".docx":
        import docx
        d = docx.Document(str(file_path))
        text = "\n".join(p.text for p in d.paragraphs if p.text.strip())
        for t in d.tables:
            rows = [[c.text.strip() for c in r.cells] for r in t.rows]
            tables.append(rows)
    elif ext in {".jpg", ".jpeg", ".png"}:
        method = "image_ocr_unavailable"
        confidence = 0.30
        text = f"[Image file: {file_path.name}. Tesseract OCR binary not configured; manual review required.]"
    else:
        text = file_path.read_text(encoding="utf-8", errors="ignore")

    return [{
        "page_number": 1,
        "text_content": text.strip(),
        "ocr_confidence": confidence,
        "extraction_method": method,
        "has_tables": len(tables) > 0,
        "table_data": json.dumps(tables) if tables else "",
    }]


def _extract_entities_and_metrics(
    db: Session,
    document: Document,
    pages_data: List[Dict[str, Any]],
) -> Dict[str, int]:
    entity_count = 0
    metric_count = 0
    seen_entities = set()

    for p in pages_data:
        page_num = p["page_number"]
        text = p["text_content"]
        if not text:
            continue

        # Subsidiaries
        for sub in SUBSIDIARIES:
            if re.search(rf"\b{sub}\b", text):
                key = ("subsidiary", sub, page_num)
                if key not in seen_entities:
                    seen_entities.add(key)
                    db.add(ExtractedEntity(
                        document_id=document.id,
                        page_number=page_num,
                        entity_type="subsidiary",
                        entity_value=sub,
                        original_text=sub,
                        confidence=0.95,
                    ))
                    entity_count += 1

        # Mine names
        for pattern in MINE_PATTERNS:
            for match in re.finditer(pattern, text):
                val = match.group(1).strip()
                key = ("mine_name", val, page_num)
                if key not in seen_entities and len(val) > 3:
                    seen_entities.add(key)
                    db.add(ExtractedEntity(
                        document_id=document.id,
                        page_number=page_num,
                        entity_type="mine_name",
                        entity_value=val,
                        original_text=match.group(0),
                        confidence=0.88,
                    ))
                    entity_count += 1

        # Reporting years
        for match in re.finditer(r"\b(FY\s*20\d{2}(?:[-–]\d{2,4})?|20[0-2]\d)\b", text):
            val = match.group(1).strip()
            key = ("reporting_year", val, page_num)
            if key not in seen_entities:
                seen_entities.add(key)
                db.add(ExtractedEntity(
                    document_id=document.id,
                    page_number=page_num,
                    entity_type="reporting_year",
                    entity_value=val,
                    original_text=val,
                    confidence=0.92,
                ))
                entity_count += 1

        # Numerical metrics
        for metric_name, pattern in METRIC_PATTERNS:
            for match in re.finditer(pattern, text, flags=re.IGNORECASE):
                raw_num = match.group(1).replace(",", "")
                try:
                    norm_val = float(raw_num)
                except ValueError:
                    norm_val = None
                unit = (match.group(2) or "").strip() if match.lastindex and match.lastindex >= 2 else ""
                snippet_start = max(0, match.start() - 40)
                snippet_end = min(len(text), match.end() + 60)
                supporting = text[snippet_start:snippet_end].replace("\n", " ").strip()

                db.add(ExtractedMetric(
                    document_id=document.id,
                    page_number=page_num,
                    metric_name=metric_name,
                    original_value=match.group(1),
                    normalized_value=norm_val,
                    unit=unit,
                    reporting_period=document.reporting_year or "",
                    mine_name=document.mine_name or "",
                    supporting_text=supporting,
                    confidence=p["ocr_confidence"] or 0.85,
                ))
                metric_count += 1

    return {"entities": entity_count, "metrics": metric_count}


def process_document(db: Session, document_id: str) -> ProcessingJob:
    """Run the full extraction, chunking, and conflict-detection pipeline for a document."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise ValueError(f"Document {document_id} not found")

    job = ProcessingJob(
        document_id=document.id,
        job_type="full",
        status="processing",
        started_at=datetime.now(timezone.utc),
    )
    db.add(job)
    document.processing_status = "processing"
    db.commit()

    try:
        file_path = DOCUMENTS_DIR / document.storage_key
        if not file_path.exists():
            raise FileNotFoundError(f"Stored file missing at {file_path}")

        ext = Path(document.original_filename).suffix.lower()
        if ext == ".pdf":
            pages_data = _extract_from_pdf(file_path)
        else:
            pages_data = _extract_from_text_or_office(file_path, ext)

        # Clear any previous processing artifacts for idempotent re-processing
        db.query(DocumentPage).filter(DocumentPage.document_id == document.id).delete()
        db.query(DocumentChunk).filter(DocumentChunk.document_id == document.id).delete()
        db.query(ExtractedEntity).filter(ExtractedEntity.document_id == document.id).delete()
        db.query(ExtractedMetric).filter(ExtractedMetric.document_id == document.id).delete()
        db.flush()

        chunk_count = 0
        for p in pages_data:
            page_row = DocumentPage(
                document_id=document.id,
                page_number=p["page_number"],
                text_content=p["text_content"],
                ocr_confidence=p["ocr_confidence"],
                extraction_method=p["extraction_method"],
                has_tables=p["has_tables"],
                table_data=p["table_data"],
            )
            db.add(page_row)

            for idx, chunk_text in enumerate(_chunk_text(p["text_content"])):
                db.add(DocumentChunk(
                    document_id=document.id,
                    page_number=p["page_number"],
                    chunk_index=idx,
                    content=chunk_text,
                    token_count=len(chunk_text.split()),
                ))
                chunk_count += 1

        counts = _extract_entities_and_metrics(db, document, pages_data)
        document.page_count = len(pages_data)
        document.processing_status = "completed"

        db.flush()
        conflicts_found = detect_conflicts_for_document(db, document.id)

        job.status = "completed"
        job.completed_at = datetime.now(timezone.utc)
        job.result_summary = json.dumps({
            "pages": len(pages_data),
            "chunks": chunk_count,
            "entities": counts["entities"],
            "metrics": counts["metrics"],
            "conflicts_detected": conflicts_found,
        })
        db.commit()
    except Exception as exc:
        db.rollback()
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            document.processing_status = "failed"
        job = db.query(ProcessingJob).filter(ProcessingJob.id == job.id).first()
        if job:
            job.status = "failed"
            job.completed_at = datetime.now(timezone.utc)
            job.error_message = str(exc)
        db.commit()
        raise

    db.refresh(job)
    return job
