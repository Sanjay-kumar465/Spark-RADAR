
import secrets
import uuid
import httpx
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.rate_limit import auth_rate_limiter
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMembership
from app.schemas.auth import (
    LoginRequest,
    GoogleLoginRequest,
    RegisterRequest,
    Token,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest
)
from app.schemas.workspace import WorkspaceResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token)
def register(req: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    auth_rate_limiter.check(request)
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=req.email.lower(),
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name,
        phone=req.phone,
        is_active=True
    )
    db.add(user)

    # Automatically create user's initial business workspace
    workspace_id = str(uuid.uuid4())
    slug = f"{req.workspace_name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"
    workspace = Workspace(
        id=workspace_id,
        name=req.workspace_name,
        slug=slug,
        business_type=req.business_type,
        state_jurisdiction=req.state_jurisdiction,
        contact_email=req.email.lower(),
        contact_phone=req.phone,
        warning_threshold_days="30,15,7,1"
    )
    db.add(workspace)

    membership = WorkspaceMembership(
        id=str(uuid.uuid4()),
        workspace_id=workspace_id,
        user_id=user_id,
        role="owner"
    )
    db.add(membership)
    db.commit()
    db.refresh(user)
    db.refresh(workspace)

    access_token = create_access_token(subject=user.id)
    ws_res = WorkspaceResponse.model_validate(workspace)
    ws_res.role = "owner"

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        workspace=ws_res
    )

@router.post("/login", response_model=Token)
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    auth_rate_limiter.check(request)
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account."
        )

    # Fetch user's primary workspace
    membership = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.user_id == user.id
    ).first()
    workspace = None
    if membership:
        workspace_obj = db.query(Workspace).filter(Workspace.id == membership.workspace_id).first()
        if workspace_obj:
            workspace = WorkspaceResponse.model_validate(workspace_obj)
            workspace.role = membership.role

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        workspace=workspace
    )

@router.post("/google", response_model=Token)
def google_login(req: GoogleLoginRequest, request: Request, db: Session = Depends(get_db)):
    auth_rate_limiter.check(request)
    if not req.credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google credential token is required."
        )

    # Validate ID token using Google tokeninfo API
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get("https://oauth2.googleapis.com/tokeninfo", params={"id_token": req.credential})
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired Google credential."
                )
            token_info = resp.json()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to reach Google OAuth verification servers: {str(exc)}"
        )

    sub = token_info.get("sub")
    email = token_info.get("email")
    email_verified = token_info.get("email_verified")
    iss = token_info.get("iss")

    if not sub or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incomplete identity claims in Google token."
        )

    if iss not in ["accounts.google.com", "https://accounts.google.com"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token issuer."
        )

    if str(email_verified).lower() not in ["true", "1"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google email address has not been verified."
        )

    # Check client ID if configured with a real ID
    if settings.GOOGLE_CLIENT_ID and not settings.GOOGLE_CLIENT_ID.startswith("your-google"):
        if token_info.get("aud") != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google token audience does not match configured client ID."
            )

    email_clean = email.lower().strip()
    user = db.query(User).filter(User.google_id == sub).first()

    if not user:
        user = db.query(User).filter(User.email == email_clean).first()
        if user:
            user.google_id = sub
            if not user.auth_provider:
                user.auth_provider = "google"
            db.commit()
            db.refresh(user)
        else:
            user_id = str(uuid.uuid4())
            name = token_info.get("name") or token_info.get("given_name") or email_clean.split("@")[0]
            user = User(
                id=user_id,
                email=email_clean,
                hashed_password=get_password_hash(secrets.token_urlsafe(32)),
                full_name=name,
                google_id=sub,
                auth_provider="google",
                is_active=True
            )
            db.add(user)

            workspace_id = str(uuid.uuid4())
            ws_name = req.workspace_name or f"{name}'s Fleet"
            slug = f"{ws_name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"
            workspace = Workspace(
                id=workspace_id,
                name=ws_name,
                slug=slug,
                business_type=req.business_type or "mixed_fleet",
                state_jurisdiction=req.state_jurisdiction or "TN",
                contact_email=email_clean,
                warning_threshold_days="30,15,7,1"
            )
            db.add(workspace)

            membership = WorkspaceMembership(
                id=str(uuid.uuid4()),
                workspace_id=workspace_id,
                user_id=user_id,
                role="owner"
            )
            db.add(membership)
            db.commit()
            db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account."
        )

    membership = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.user_id == user.id
    ).first()
    workspace = None
    if membership:
        workspace_obj = db.query(Workspace).filter(Workspace.id == membership.workspace_id).first()
        if workspace_obj:
            workspace = WorkspaceResponse.model_validate(workspace_obj)
            workspace.role = membership.role

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        workspace=workspace
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    auth_rate_limiter.check(request)
    user = db.query(User).filter(User.email == req.email.lower()).first()
    # To prevent account enumeration in production, we still return a generic success message,
    # but include reset_token for dev/test verification.
    reset_token = None
    if user:
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        db.commit()

    return {
        "message": "If this email is registered, a password reset link has been generated.",
        "reset_token": reset_token
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    if not req.token or not req.new_password:
        raise HTTPException(status_code=400, detail="Token and new password are required.")

    user = db.query(User).filter(User.reset_token == req.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token.")

    # Check expiration
    if not user.reset_token_expires_at:
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    # Handle timezone-aware or naive datetimes safely
    expires_at = user.reset_token_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Password reset token has expired.")

    user.hashed_password = get_password_hash(req.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()

    return {"message": "Password has been successfully reset. You may now log in with your new password."}

@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password does not match.")

    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully."}

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out."}
