"""Authorization-scoped hybrid search service over document chunks."""
import math
import re
from collections import Counter
from typing import List, Dict, Any, Optional

from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.knowledge import DocumentChunk
from app.models.user import User
from app.security.rbac import has_role


STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "of", "in", "to", "for", "on", "with", "at", "by", "from", "as",
    "what", "which", "who", "whom", "when", "where", "why", "how",
    "and", "or", "but", "if", "then", "than", "that", "this", "these", "those",
    "do", "does", "did", "have", "has", "had", "can", "could", "will", "would",
}


def _tokenize(text: str) -> List[str]:
    return [w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in STOPWORDS and len(w) > 1]


def search_authorized_chunks(
    db: Session,
    user: User,
    query: str,
    scope: str = "all",
    limit: int = 6,
    subsidiary: Optional[str] = None,
    category: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Retrieve and rank document chunks strictly within the user's authorized documents."""
    doc_query = db.query(Document).filter(
        Document.is_deleted == False,
        Document.processing_status == "completed",
    )

    # Authorization filter: non-admin users cannot access Restricted docs unless they uploaded them
    if not has_role(user, "admin"):
        doc_query = doc_query.filter(
            (Document.classification != "Restricted") | (Document.uploaded_by == user.id)
        )

    if subsidiary:
        doc_query = doc_query.filter(Document.subsidiary == subsidiary)
    if category:
        doc_query = doc_query.filter(Document.category == category)
    if scope and scope != "all":
        doc_query = doc_query.filter(
            (Document.subsidiary.ilike(f"%{scope}%"))
            | (Document.mine_name.ilike(f"%{scope}%"))
            | (Document.category.ilike(f"%{scope}%"))
        )

    authorized_docs = {d.id: d for d in doc_query.all()}
    if not authorized_docs:
        return []

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id.in_(list(authorized_docs.keys())))
        .all()
    )
    if not chunks:
        return []

    query_tokens = _tokenize(query)
    if not query_tokens:
        return []

    # Compute IDF across authorized chunks
    doc_freq = Counter()
    chunk_tokens_list = []
    for c in chunks:
        tokens = _tokenize(c.content)
        chunk_tokens_list.append(tokens)
        for t in set(tokens):
            doc_freq[t] += 1

    total_chunks = len(chunks)
    scored: List[Dict[str, Any]] = []

    for chunk, tokens in zip(chunks, chunk_tokens_list):
        if not tokens:
            continue
        tf = Counter(tokens)
        score = 0.0
        for qt in query_tokens:
            if qt in tf:
                idf = math.log(1.0 + (total_chunks / (1.0 + doc_freq[qt])))
                score += (1.0 + math.log(tf[qt])) * idf

        # Exact phrase bonus
        if query.lower() in chunk.content.lower():
            score += 3.0

        if score > 0:
            doc = authorized_docs[chunk.document_id]
            norm_score = min(0.99, round(score / (len(query_tokens) * 3.0 + 3.0), 4))
            scored.append({
                "chunk_id": chunk.id,
                "document_id": doc.id,
                "document_title": doc.title,
                "mine_name": doc.mine_name,
                "subsidiary": doc.subsidiary,
                "reporting_year": doc.reporting_year,
                "page_number": chunk.page_number,
                "content": chunk.content,
                "relevance_score": norm_score,
            })

    scored.sort(key=lambda x: x["relevance_score"], reverse=True)
    return scored[:limit]
