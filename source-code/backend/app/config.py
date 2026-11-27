"""Application configuration loaded from environment variables."""
import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DOCUMENTS_DIR = DATA_DIR / "documents"
FAISS_DIR = DATA_DIR / "faiss_index"
DB_PATH = DATA_DIR / "geostratum.db"

# Ensure directories exist
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
FAISS_DIR.mkdir(parents=True, exist_ok=True)

# Database
DATABASE_URL = f"sqlite:///{DB_PATH}"

# JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "geostratum-dev-secret-change-in-production-2024")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

# LLM
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")  # gemini | none

# Upload limits
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "200"))
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".csv", ".jpg", ".jpeg", ".png"}

# Embedding
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "500"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))

# App
APP_NAME = "GeoStratum Intelligence"
APP_VERSION = "1.0.0-prototype"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
