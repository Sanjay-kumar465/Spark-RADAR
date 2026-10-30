import httpx
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
import jwt
from jwt import PyJWKClient, ExpiredSignatureError, InvalidTokenError
from app.core.config import settings

GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"]
GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"

# Cached JWKS client for efficient cryptographic verification without fetching certs on every request
_jwks_client: Optional[PyJWKClient] = None

def get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(GOOGLE_JWKS_URL, cache_keys=True, lifespan=3600)
    return _jwks_client

def verify_google_credential(credential: str) -> Dict[str, Any]:
    """
    Verify Google OAuth 2.0 credential (ID token) securely.
    
    Validates:
    - Token cryptographic signature (RS256) via Google public keys
    - Token issuer (accounts.google.com or https://accounts.google.com)
    - Token audience (matches GOOGLE_CLIENT_ID)
    - Token expiration (exp timestamp)
    - Email verification claim
    
    Supports:
    1. Official `google.oauth2.id_token` library if installed
    2. Cryptographic `PyJWKClient` RSA validation against Google public JWKS
    3. Google tokeninfo validation fallback
    """
    if not credential or not credential.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google credential token is required."
        )

    # Verify server has GOOGLE_CLIENT_ID configured
    expected_client_id = settings.GOOGLE_CLIENT_ID.strip() if settings.GOOGLE_CLIENT_ID else ""
    if not expected_client_id or expected_client_id.startswith("your-google"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Backend Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in the server environment."
        )

    token_info: Optional[Dict[str, Any]] = None
    verification_error: Optional[str] = None

    # Layer 1: Google official google-auth library
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        token_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            audience=expected_client_id
        )
    except (ImportError, Exception) as exc:
        verification_error = str(exc)

    # Layer 2: PyJWKClient cryptographic validation against Google's public JWKS
    if token_info is None:
        try:
            jwks_client = get_jwks_client()
            signing_key = jwks_client.get_signing_key_from_jwt(credential)
            token_info = jwt.decode(
                credential,
                signing_key.key,
                algorithms=["RS256"],
                audience=expected_client_id,
                issuer=GOOGLE_ISSUERS,
                options={"verify_exp": True, "verify_aud": True, "verify_iss": True}
            )
        except ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google credential token has expired. Please sign in again."
            )
        except InvalidTokenError as ite:
            verification_error = f"Token validation error: {str(ite)}"
        except Exception as e:
            verification_error = f"JWKS verification error: {str(e)}"

    # Layer 3: Google tokeninfo verification fallback
    if token_info is None:
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.get(GOOGLE_TOKENINFO_URL, params={"id_token": credential})
                if resp.status_code == 200:
                    info = resp.json()
                    # Validate audience
                    if info.get("aud") != expected_client_id:
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Google token audience does not match configured GOOGLE_CLIENT_ID."
                        )
                    # Validate issuer
                    if info.get("iss") not in GOOGLE_ISSUERS:
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid Google token issuer."
                        )
                    token_info = info
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid or expired Google credential."
                    )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Unable to reach Google OAuth verification servers: {str(exc)}"
            )

    if not token_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unable to verify Google credential: {verification_error or 'Invalid token.'}"
        )

    sub = token_info.get("sub")
    email = token_info.get("email")
    email_verified = token_info.get("email_verified")
    name = token_info.get("name") or token_info.get("given_name")

    if not sub or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incomplete identity claims in Google token."
        )

    if str(email_verified).lower() not in ["true", "1", "true"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google email address has not been verified."
        )

    return {
        "sub": str(sub),
        "email": email.lower().strip(),
        "name": name or email.split("@")[0]
    }

