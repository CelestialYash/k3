"""User, Role, and UserRole models."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base


def _uuid():
    return str(uuid.uuid4())


def _now():
    return datetime.now(timezone.utc)


class UserRole(Base):
    __tablename__ = "user_roles"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(String, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime, default=_now)


class Role(Base):
    __tablename__ = "roles"
    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), default="")
    created_at = Column(DateTime, default=_now)
    users = relationship("User", secondary="user_roles", back_populates="roles")


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    designation = Column(String(255), default="")
    subsidiary = Column(String(255), default="")
    location = Column(String(255), default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)
    last_login = Column(DateTime, nullable=True)
    roles = relationship("Role", secondary="user_roles", back_populates="users")
    documents = relationship("Document", back_populates="uploader")
    conversations = relationship("Conversation", back_populates="user")
