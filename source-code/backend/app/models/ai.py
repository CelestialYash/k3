"""AI conversation, message, and citation models."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def _uuid():
    return str(uuid.uuid4())

def _now():
    return datetime.now(timezone.utc)


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), default="New Conversation")
    search_scope = Column(String(255), default="all")
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True, default=_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # user | assistant | system
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=_now)

    conversation = relationship("Conversation", back_populates="messages")
    citations = relationship("ChatCitation", back_populates="message", cascade="all, delete-orphan")


class ChatCitation(Base):
    __tablename__ = "chat_citations"
    id = Column(String, primary_key=True, default=_uuid)
    message_id = Column(String, ForeignKey("chat_messages.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=True)
    excerpt = Column(Text, default="")
    relevance_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=_now)

    message = relationship("ChatMessage", back_populates="citations")
