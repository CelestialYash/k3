"""Role-based access control helpers."""
from functools import wraps
from typing import List

from fastapi import HTTPException, status


ROLE_HIERARCHY = {
    "super_admin": 5,
    "admin": 4,
    "researcher": 3,
    "analyst": 2,
    "viewer": 1,
}


def get_user_role_names(user) -> List[str]:
    """Extract role names from a user object."""
    return [r.name for r in user.roles]


def has_role(user, required_role: str) -> bool:
    """Check if user has the required role or higher."""
    user_roles = get_user_role_names(user)
    required_level = ROLE_HIERARCHY.get(required_role, 0)
    return any(ROLE_HIERARCHY.get(r, 0) >= required_level for r in user_roles)


def require_role(required_role: str):
    """Dependency factory that checks for a minimum role level."""
    def checker(current_user):
        if not has_role(current_user, required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role}"
            )
        return current_user
    return checker
