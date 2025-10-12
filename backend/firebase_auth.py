from typing import Optional, Dict, Any
from fastapi import Header, HTTPException
from firebase_admin import auth as fb_auth
import firebase_admin_init  # side-effect init

def _verify_bearer_token(authorization: Optional[str]) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing ID token")

    try:
        claims = fb_auth.verify_id_token(token, check_revoked=True)
        return claims
    except fb_auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token has been revoked")
    except fb_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase ID token")

def get_current_firebase_user(authorization: str = Header(...)) -> Dict[str, Any]:
    return _verify_bearer_token(authorization)

def get_current_firebase_user_optional(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    if authorization is None:
        return None
    return _verify_bearer_token(authorization)
