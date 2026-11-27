"""Structured report generation service (PDF / DOCX / XLSX)."""
import json
import uuid
from pathlib import Path
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.config import DOCUMENTS_DIR
from app.models.document import Document
from app.models.extraction import ExtractedMetric
from app.models.report import GeneratedReport
from app.models.verification import Conflict


def generate_report(
    db: Session,
    user_id: str,
    title: str,
    report_type: str = "summary",
    fmt: str = "pdf",
    parameters: dict | None = None,
) -> GeneratedReport:
    """Generate a real PDF/DOCX/XLSX report from database records."""
    params = parameters or {}
    report = GeneratedReport(
        title=title,
        report_type=report_type,
        format=fmt,
        created_by=user_id,
        status="generating",
        parameters=json.dumps(params),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    docs = db.query(Document).filter(Document.is_deleted == False).limit(50).all()
    metrics = db.query(ExtractedMetric).limit(50).all()
    conflicts = db.query(Conflict).limit(20).all()

    storage_key = f"report_{uuid.uuid4().hex}.{fmt}"
    out_path = DOCUMENTS_DIR / storage_key

    try:
        if fmt == "xlsx":
            import openpyxl
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Metrics Summary"
            ws.append(["Metric", "Value", "Unit", "Mine", "Period", "Status", "Confidence"])
            for m in metrics:
                ws.append([m.metric_name, m.original_value, m.unit, m.mine_name, m.reporting_period, m.verification_status, m.confidence])
            wb.save(str(out_path))
        elif fmt == "docx":
            import docx
            d = docx.Document()
            d.add_heading(title, level=1)
            d.add_paragraph(f"Report Type: {report_type} | Documents Included: {len(docs)} | Metrics: {len(metrics)}")
            d.add_heading("Extracted Metrics", level=2)
            for m in metrics[:25]:
                d.add_paragraph(f"- {m.metric_name}: {m.original_value} {m.unit} ({m.mine_name}, {m.reporting_period}) [{m.verification_status}]")
            d.save(str(out_path))
        else:
            c = canvas.Canvas(str(out_path), pagesize=A4)
            width, height = A4
            y = height - 50
            c.setFont("Helvetica-Bold", 16)
            c.drawString(40, y, title[:70])
            y -= 24
            c.setFont("Helvetica", 10)
            c.drawString(40, y, f"GeoStratum Intelligence (CMPDI / CIL) | Type: {report_type} | Records: {len(docs)} docs, {len(metrics)} metrics")
            y -= 28

            c.setFont("Helvetica-Bold", 12)
            c.drawString(40, y, "Verified & Extracted Geological Metrics")
            y -= 18
            c.setFont("Helvetica", 9)
            for m in metrics[:30]:
                if y < 60:
                    c.showPage()
                    y = height - 50
                    c.setFont("Helvetica", 9)
                line = f"- {m.metric_name}: {m.original_value} {m.unit} | Mine: {m.mine_name or 'N/A'} | Status: {m.verification_status}"
                c.drawString(45, y, line[:95])
                y -= 14

            if conflicts:
                y -= 12
                c.setFont("Helvetica-Bold", 12)
                c.drawString(40, y, f"Flagged Discrepancies ({len(conflicts)})")
                y -= 18
                c.setFont("Helvetica", 9)
                for cf in conflicts[:10]:
                    if y < 60:
                        c.showPage()
                        y = height - 50
                        c.setFont("Helvetica", 9)
                    c.drawString(45, y, f"- [{cf.severity.upper()}] {cf.description[:90]}")
                    y -= 14
            c.save()

        report.storage_key = storage_key
        report.status = "completed"
        db.commit()
        db.refresh(report)
    except Exception:
        report.status = "failed"
        db.commit()
        raise

    return report
