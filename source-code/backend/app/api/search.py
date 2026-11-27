"""Authorization-scoped search routes."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.search_service import search_authorized_chunks

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
def search(
    q: str = Query(..., min_length=1),
    subsidiary: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = search_authorized_chunks(
        db=db,
        user=current_user,
        query=q,
        limit=limit,
        subsidiary=subsidiary,
        category=category,
    )
    return {"query": q, "count": len(results), "results": results}
