"""Authentication routes: login, me, logout."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas import LoginRequest, TokenResponse, UserResponse
from app.security.auth import verify_password, create_access_token
from app.security.rbac import get_user_role_names
from app.services.audit_service import record_audit

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _to_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        designation=user.designation,
        subsidiary=user.subsidiary,
        location=user.location,
        is_active=user.is_active,
        roles=get_user_role_names(user),
        created_at=user.created_at,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).options(joinedload(User.roles)).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        record_audit(
            db,
            action="LOGIN_FAILED",
            user_email=payload.email,
            resource_type="auth",
            details="Invalid credentials",
            ip_address=request.client.host if request.client else "",
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "roles": get_user_role_names(user)})
    record_audit(
        db,
        action="LOGIN_SUCCESS",
        user_id=user.id,
        user_email=user.email,
        resource_type="auth",
        details="User logged in",
        ip_address=request.client.host if request.client else "",
    )
    return TokenResponse(access_token=token, user=_to_user_response(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return _to_user_response(current_user)


@router.post("/logout")
def logout(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record_audit(
        db,
        action="LOGOUT",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="auth",
        ip_address=request.client.host if request.client else "",
    )
    return {"message": "Logged out successfully"}
