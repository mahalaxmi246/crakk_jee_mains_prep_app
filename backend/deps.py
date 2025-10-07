# backend/deps.py
from datetime import datetime, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User, AccessTokenBlocklist
from security import decode_token

# existing:
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_token(token)
    if not payload or "sub" not in payload or "jti" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    jti = payload["jti"]
    if db.query(AccessTokenBlocklist).filter(AccessTokenBlocklist.jti == jti).first():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Logged out",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username = payload["sub"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# NEW: optional auth (no 401 if missing)
_http_bearer_optional = HTTPBearer(auto_error=False)

def get_current_user_optional(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(_http_bearer_optional),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Return User if Authorization header is present & valid, else None."""
    if creds is None:
        return None
    token = creds.credentials
    payload = decode_token(token)
    if not payload or "sub" not in payload or "jti" not in payload:
        return None

    jti = payload["jti"]
    if db.query(AccessTokenBlocklist).filter(AccessTokenBlocklist.jti == jti).first():
        return None

    username = payload["sub"]
    return db.query(User).filter(User.username == username).first()
