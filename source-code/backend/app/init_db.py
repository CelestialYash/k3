"""Database initialization and realistic CMPDI/CIL demo data seeding."""
import json
import uuid
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.config import DOCUMENTS_DIR
from app.database import Base, engine, SessionLocal
from app.models.user import User, Role, UserRole
from app.models.document import Document
from app.models.audit import AuditLog
from app.security.auth import hash_password
from app.services.processing_service import process_document


DEMO_USERS = [
    ("admin@cmpdi.cil.in", "Admin@1234", "Dr. Rajeshwar Sharma", "Chief General Manager (Geology)", "CMPDI", "Ranchi HQ", "super_admin"),
    ("researcher@cmpdi.cil.in", "Research@1234", "Ananya Verma", "Senior Geologist", "SECL", "Bilaspur RI-V", "researcher"),
    ("analyst@cmpdi.cil.in", "Analyst@1234", "Vikramaditya Rao", "Mining Data Analyst", "CCL", "Ranchi RI-III", "analyst"),
    ("viewer@cmpdi.cil.in", "Viewer@1234", "Suresh Kumar", "Survey Officer", "BCCL", "Dhanbad RI-II", "viewer"),
]

SAMPLE_DOCS = [
    {
        "title": "CMPDI Project Feasibility Report — Gevra OCP (2021)",
        "filename": "CMPDI_Feasibility_Gevra_2021.pdf",
        "category": "Geological Reports",
        "subsidiary": "SECL",
        "mine_name": "Gevra OCP",
        "reporting_year": "2021",
        "classification": "Internal",
        "paragraphs": [
            "CMPDI Regional Institute-V Bilaspur — Project Feasibility Report for Gevra Open Cast Project (SECL), FY 2021.",
            "Geological Exploration Summary: Proved coal reserves in the central and dip blocks stand established at 1,248.50 MT.",
            "Mining Parameters: Approved peak capacity is 70.00 MTPA. Composite stripping ratio is 1:1.85 m3/te.",
            "Primary Seam Thickness: Upper and Lower Kusmunda seams average 54.2 m total thickness.",
            "Overburden removal planned at 129.5 Mcum annually using surface miners and draglines.",
        ],
    },
    {
        "title": "SECL Board Approved Revised Mine Plan — Gevra OCP (2024)",
        "filename": "SECL_Revised_Mine_Plan_Gevra_2024.pdf",
        "category": "Mining Reports",
        "subsidiary": "SECL",
        "mine_name": "Gevra OCP",
        "reporting_year": "2024",
        "classification": "Internal",
        "paragraphs": [
            "SECL Technical Directorate — Revised Mining Plan for Gevra OCP (SECL), FY 2024.",
            "Reserve Upgrade: Revised proved coal reserves certified at 1,385.20 MT following 28 infill boreholes in Dip Block IV.",
            "Volumetric Stripping Ratio: Composite stripping ratio increased to 1:1.94 m3/te due to highwall slope reprofiling to 60 degrees.",
            "Primary Seam Thickness: Upper & Lower Kusmunda seam thickness measured at 56.6 m.",
            "Annual coal production target remains 70.00 MTPA with continuous miners and in-pit crushing.",
        ],
    },
    {
        "title": "North Karanpura Seam IV Exploration Report (2024)",
        "filename": "North_Karanpura_Exploration_2024.pdf",
        "category": "Exploration Records",
        "subsidiary": "CCL",
        "mine_name": "North Karanpura",
        "reporting_year": "2024",
        "classification": "Restricted",
        "paragraphs": [
            "CMPDI RI-III Ranchi — Borehole Core Log BH-402 for North Karanpura Seam IV, FY 2024.",
            "Seam thickness logged at 14.2 m in BH-402 exploration core.",
            "Coal production from Ashok OCP extension recorded at 18.40 MT with overburden removal of 32.1 Mcum.",
        ],
    },
    {
        "title": "CCL Production Bench Log — North Karanpura (2024)",
        "filename": "CCL_Production_North_Karanpura_2024.pdf",
        "category": "Production Data",
        "subsidiary": "CCL",
        "mine_name": "North Karanpura",
        "reporting_year": "2024",
        "classification": "Internal",
        "paragraphs": [
            "CCL Technical Directorate — Production Bench Log for North Karanpura Seam IV, FY 2024.",
            "Seam thickness measured at production bench is 11.8 m.",
        ],
    },
]


def _create_sample_pdf(path: Path, title: str, paragraphs: list[str]) -> None:
    c = canvas.Canvas(str(path), pagesize=A4)
    width, height = A4
    y = height - 60
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, y, title[:75])
    y -= 30
    c.setFont("Helvetica", 11)
    for para in paragraphs:
        c.drawString(40, y, para[:95])
        y -= 22
        if len(para) > 95:
            c.drawString(40, y, para[95:190])
            y -= 22
    c.save()


def init_database() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Roles
        role_map = {}
        for role_name, desc in [
            ("super_admin", "Organization-wide super administrator"),
            ("admin", "Repository and user administrator"),
            ("researcher", "Upload documents and review extractions"),
            ("analyst", "Search records, query AI, generate reports"),
            ("viewer", "Read-only access to permitted records"),
        ]:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name, description=desc)
                db.add(role)
                db.flush()
            role_map[role_name] = role

        # 2. Demo Users
        admin_user = None
        for email, pwd, name, desig, sub, loc, role_name in DEMO_USERS:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    password_hash=hash_password(pwd),
                    full_name=name,
                    designation=desig,
                    subsidiary=sub,
                    location=loc,
                    is_active=True,
                )
                db.add(user)
                db.flush()
                db.add(UserRole(user_id=user.id, role_id=role_map[role_name].id))
            if role_name == "super_admin":
                admin_user = user

        db.commit()

        # 3. Sample Documents (only if repository is empty)
        if db.query(Document).count() == 0 and admin_user:
            for item in SAMPLE_DOCS:
                storage_key = f"{uuid.uuid4().hex}.pdf"
                pdf_path = DOCUMENTS_DIR / storage_key
                _create_sample_pdf(pdf_path, item["title"], item["paragraphs"])
                doc = Document(
                    title=item["title"],
                    original_filename=item["filename"],
                    storage_key=storage_key,
                    file_size=pdf_path.stat().st_size,
                    mime_type="application/pdf",
                    category=item["category"],
                    subsidiary=item["subsidiary"],
                    mine_name=item["mine_name"],
                    reporting_year=item["reporting_year"],
                    classification=item["classification"],
                    uploaded_by=admin_user.id,
                    processing_status="pending",
                )
                db.add(doc)
                db.commit()
                db.refresh(doc)
                process_document(db, doc.id)

            db.add(AuditLog(
                user_id=admin_user.id,
                user_email=admin_user.email,
                action="SYSTEM_SEED",
                resource_type="system",
                resource_id="init",
                details="Initialized GeoStratum Intelligence prototype database with sample CMPDI documents.",
            ))
            db.commit()
    finally:
        db.close()
