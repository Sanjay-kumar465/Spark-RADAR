from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Header, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMembership

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    db: Session = Depends(get_db),
    header_token: Optional[str] = Depends(oauth2_scheme),
    query_token: Optional[str] = Query(None, alias="token")
) -> User:
    token = header_token or query_token
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def get_current_workspace(
    x_workspace_id: Optional[str] = Header(None, alias="X-Workspace-Id"),
    query_workspace_id: Optional[str] = Query(None, alias="workspace_id"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Workspace:
    """
    Validates workspace isolation. Ensures the current user is a valid member
    of the requested workspace, preventing cross-tenant leakage.
    """
    target_ws_id = x_workspace_id or query_workspace_id
    if target_ws_id:
        membership = db.query(WorkspaceMembership).filter(
            WorkspaceMembership.workspace_id == target_ws_id,
            WorkspaceMembership.user_id == current_user.id
        ).first()
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this workspace."
            )
        workspace = db.query(Workspace).filter(Workspace.id == target_ws_id).first()
        if not workspace:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
        return workspace

    # Fallback to the user's primary/first workspace
    first_membership = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.user_id == current_user.id
    ).first()
    if not first_membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No workspace associated with this user. Please complete onboarding."
        )
    workspace = db.query(Workspace).filter(Workspace.id == first_membership.workspace_id).first()
    return workspace

def check_workspace_role(allowed_roles: list[str]):
    def role_checker(
        workspace: Workspace = Depends(get_current_workspace),
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        membership = db.query(WorkspaceMembership).filter(
            WorkspaceMembership.workspace_id == workspace.id,
            WorkspaceMembership.user_id == current_user.id
        ).first()
        if not membership or membership.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this operation."
            )
        return membership
    return role_checker
