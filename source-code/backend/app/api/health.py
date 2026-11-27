"""Health check endpoint."""
from fastapi import APIRouter
from app.config import APP_NAME, APP_VERSION, GEMINI_API_KEY

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    return {
        "status": "operational",
        "app": APP_NAME,
        "version": APP_VERSION,
        "llm_configured": bool(GEMINI_API_KEY),
    }
