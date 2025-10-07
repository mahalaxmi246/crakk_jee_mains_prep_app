# backend/deps_admin.py
from fastapi import Depends, HTTPException, status
from models import User
from deps import get_current_user

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Allows only admin users to proceed.
    """
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to perform this action",
        )
    return current_user
