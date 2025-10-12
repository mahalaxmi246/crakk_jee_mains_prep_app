# backend/routes/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from firebase_admin import auth as fb_auth

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

class FirebaseExchangeRequest(BaseModel):
    id_token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/firebase", response_model=TokenResponse)
def exchange_firebase_token(data: FirebaseExchangeRequest):
    """
    Verify Firebase ID token and issue a backend JWT.
    For now, we'll return the same Firebase token or a dummy JWT.
    """
    try:
        decoded = fb_auth.verify_id_token(data.id_token, check_revoked=True)
    except fb_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired")
    except fb_auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token revoked")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase ID token")

    # TODO: lookup or create user in DB using decoded["uid"]

    # For now, just return a fake backend JWT for testing
    return TokenResponse(access_token=data.id_token)
