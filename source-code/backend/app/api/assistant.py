"""AI Assistant RAG routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.ai import Conversation, ChatMessage
from app.models.user import User
from app.schemas import AIAnswerResponse, AskQuestionRequest
from app.security.rbac import has_role
from app.services.ai_service import ask_assistant
from app.services.audit_service import record_audit

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


@router.post("/ask", response_model=AIAnswerResponse)
def ask_question(
    payload: AskQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not has_role(current_user, "analyst"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Analyst or higher role required for AI Assistant")

    result = ask_assistant(
        db=db,
        user=current_user,
        question=payload.question,
        conversation_id=payload.conversation_id,
        search_scope=payload.search_scope,
    )
    record_audit(
        db,
        action="AI_QUERY",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="conversation",
        resource_id=result["conversation_id"],
        details=f"Query: {payload.question[:120]} (citations: {len(result['citations'])})",
    )
    return result


@router.get("/conversations")
def list_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .limit(20)
        .all()
    )
    return [
        {"id": c.id, "title": c.title, "search_scope": c.search_scope, "created_at": c.created_at}
        for c in convs
    ]
