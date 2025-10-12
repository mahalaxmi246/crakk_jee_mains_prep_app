# deps.py
from typing import Generator
from sqlalchemy.orm import Session
from database import SessionLocal

# ⚠️ Remove side-effects from deps; do this in main.py instead:
# import firebase_admin_init

def get_db() -> Generator[Session, None, None]:
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _ensure_db_user(db: Session, claims: dict):
    # ⬇️ Lazy import avoids circular import issues
    from models import User

    firebase_uid = claims.get("uid")
    if not firebase_uid:
        raise ValueError("Firebase token missing uid")

    email = (claims.get("email") or f"{firebase_uid}@firebase.local").lower()
    display_name = claims.get("name") or claims.get("display_name")
    photo_url = claims.get("picture") or claims.get("photo_url")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if user:
        changed = False
        if email and user.email != email:
            user.email = email; changed = True
        if display_name and user.display_name != display_name:
            user.display_name = display_name; changed = True
        if photo_url and user.photo_url != photo_url:
            user.photo_url = photo_url; changed = True
        if changed:
            db.commit()
        return user

    user = User(
        firebase_uid=firebase_uid,
        email=email,
        display_name=display_name,
        photo_url=photo_url,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Re-export for convenience (safe as long as these don’t import deps at module import)
from firebase_auth import (
    get_current_firebase_user as _get_current_firebase_user,
    get_current_firebase_user_optional as _get_current_firebase_user_optional,
)

get_current_firebase_user = _get_current_firebase_user
get_current_firebase_user_optional = _get_current_firebase_user_optional

__all__ = ["get_db", "_ensure_db_user", "get_current_firebase_user", "get_current_firebase_user_optional"]
