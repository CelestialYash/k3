"""User management routes (Admin / Super Admin only)."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, Role, UserRole
from app.schemas import CreateUserRequest, UpdateUserRequest, UserResponse
from app.security.auth import hash_password
from app.security.rbac import has_role, get_user_role_names
from app.services.audit_service import record_audit

router = APIRouter(prefix="/users", tags=["Users"])


def _to_response(u: User) -> UserResponse:
    return UserResponse(
        id=u.id,
        email=u.email,
        full_name=u.full_name,
        designation=u.designation,
        subsidiary=u.subsidiary,
        location=u.location,
        is_active=u.is_active,
        roles=get_user_role_names(u),
        created_at=u.created_at,
    )


@router.get("", response_model=List[UserResponse])
def list_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not has_role(current_user, "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    users = db.query(User).options(joinedload(User.roles)).order_by(User.created_at.desc()).all()
    return [_to_response(u) for u in users]


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: CreateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not has_role(current_user, "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    role = db.query(Role).filter(Role.name == payload.role).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown role: {payload.role}")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        designation=payload.designation,
        subsidiary=payload.subsidiary,
        location=payload.location,
        is_active=True,
    )
    db.add(user)
    db.flush()
    db.add(UserRole(user_id=user.id, role_id=role.id))
    db.commit()

    user = db.query(User).options(joinedload(User.roles)).filter(User.id == user.id).first()
    record_audit(
        db,
        action="USER_CREATED",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="user",
        resource_id=user.id,
        details=f"Created user {user.email} with role {payload.role}",
    )
    return _to_response(user)


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not has_role(current_user, "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    user = db.query(User).options(joinedload(User.roles)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.designation is not None:
        user.designation = payload.designation
    if payload.subsidiary is not None:
        user.subsidiary = payload.subsidiary
    if payload.location is not None:
        user.location = payload.location
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.role is not None:
        role = db.query(Role).filter(Role.name == payload.role).first()
        if not role:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
        db.query(UserRole).filter(UserRole.user_id == user.id).delete()
        db.add(UserRole(user_id=user.id, role_id=role.id))

    db.commit()
    user = db.query(User).options(joinedload(User.roles)).filter(User.id == user.id).first()
    record_audit(
        db,
        action="USER_UPDATED",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="user",
        resource_id=user.id,
        details=f"Updated user {user.email}",
    )
    return _to_response(user)
