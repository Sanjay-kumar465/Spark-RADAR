import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMembership
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceUpdate,
    WorkspaceResponse,
    MemberResponse,
    InviteMemberRequest,
    UpdateMemberRoleRequest
)
from app.core.security import get_password_hash
from app.api.deps import get_current_user, get_current_workspace, check_workspace_role

router = APIRouter()

@router.get("/current", response_model=WorkspaceResponse)
def get_current_workspace_info(
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    membership = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.workspace_id == workspace.id,
        WorkspaceMembership.user_id == current_user.id
    ).first()
    res = WorkspaceResponse.model_validate(workspace)
    res.role = membership.role if membership else "member"
    return res

@router.get("/my-workspaces", response_model=List[WorkspaceResponse])
def get_user_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memberships = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.user_id == current_user.id
    ).all()
    results = []
    for m in memberships:
        ws = db.query(Workspace).filter(Workspace.id == m.workspace_id).first()
        if ws:
            item = WorkspaceResponse.model_validate(ws)
            item.role = m.role
            results.append(item)
    return results

@router.post("", response_model=WorkspaceResponse)
def create_workspace(
    req: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ws_id = str(uuid.uuid4())
    slug = req.slug or f"{req.name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"
    workspace = Workspace(
        id=ws_id,
        name=req.name,
        slug=slug,
        business_type=req.business_type,
        state_jurisdiction=req.state_jurisdiction,
        contact_email=req.contact_email or current_user.email,
        contact_phone=req.contact_phone,
        warning_threshold_days=req.warning_threshold_days or "30,15,7,1"
    )
    db.add(workspace)
    membership = WorkspaceMembership(
        id=str(uuid.uuid4()),
        workspace_id=ws_id,
        user_id=current_user.id,
        role="owner"
    )
    db.add(membership)
    db.commit()
    db.refresh(workspace)
    res = WorkspaceResponse.model_validate(workspace)
    res.role = "owner"
    return res

@router.put("/current", response_model=WorkspaceResponse)
def update_current_workspace(
    req: WorkspaceUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workspace, field, value)
    db.commit()
    db.refresh(workspace)
    res = WorkspaceResponse.model_validate(workspace)
    res.role = membership.role
    return res

@router.get("/members", response_model=List[MemberResponse])
def get_workspace_members(
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memberships = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.workspace_id == workspace.id
    ).all()
    results = []
    for m in memberships:
        user = db.query(User).filter(User.id == m.user_id).first()
        if user:
            results.append(MemberResponse(
                id=m.id,
                user_id=user.id,
                role=m.role,
                full_name=user.full_name,
                email=user.email,
                created_at=m.created_at
            ))
    return results

@router.post("/members", response_model=MemberResponse)
def invite_workspace_member(
    req: InviteMemberRequest,
    workspace: Workspace = Depends(get_current_workspace),
    current_membership: WorkspaceMembership = Depends(check_workspace_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    if req.role not in ["admin", "manager", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be one of 'admin', 'manager', or 'staff'."
        )

    # Check if user already exists
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Create user with initial credentials
        user_id = str(uuid.uuid4())
        initial_pw = req.temporary_password or "SparkRadar@2026"
        user = User(
            id=user_id,
            email=req.email.lower(),
            hashed_password=get_password_hash(initial_pw),
            full_name=req.full_name or req.email.split("@")[0].capitalize(),
            is_active=True
        )
        db.add(user)
        db.flush()

    # Check if user is already a member of this workspace
    existing_membership = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.workspace_id == workspace.id,
        WorkspaceMembership.user_id == user.id
    ).first()
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This user is already a member of this workspace."
        )

    membership = WorkspaceMembership(
        id=str(uuid.uuid4()),
        workspace_id=workspace.id,
        user_id=user.id,
        role=req.role
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)

    return MemberResponse(
        id=membership.id,
        user_id=user.id,
        role=membership.role,
        full_name=user.full_name,
        email=user.email,
        created_at=membership.created_at
    )

@router.put("/members/{member_id}", response_model=MemberResponse)
def update_member_role(
    member_id: str,
    req: UpdateMemberRoleRequest,
    workspace: Workspace = Depends(get_current_workspace),
    current_membership: WorkspaceMembership = Depends(check_workspace_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    target_membership = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.id == member_id,
        WorkspaceMembership.workspace_id == workspace.id
    ).first()
    if not target_membership:
        raise HTTPException(status_code=404, detail="Workspace member not found.")

    if req.role not in ["admin", "manager", "staff", "owner"]:
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    # Only owners can change owner status or promote someone to owner
    if (target_membership.role == "owner" or req.role == "owner") and current_membership.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace owners can modify owner permissions."
        )

    target_membership.role = req.role
    db.commit()
    db.refresh(target_membership)

    user = db.query(User).filter(User.id == target_membership.user_id).first()
    return MemberResponse(
        id=target_membership.id,
        user_id=user.id,
        role=target_membership.role,
        full_name=user.full_name,
        email=user.email,
        created_at=target_membership.created_at
    )

@router.delete("/members/{member_id}")
def remove_workspace_member(
    member_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    current_membership: WorkspaceMembership = Depends(check_workspace_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    target_membership = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.id == member_id,
        WorkspaceMembership.workspace_id == workspace.id
    ).first()
    if not target_membership:
        raise HTTPException(status_code=404, detail="Workspace member not found.")

    # Owners cannot be removed
    if target_membership.role == "owner":
        raise HTTPException(status_code=400, detail="Cannot remove the workspace owner.")

    # Admins cannot remove other admins
    if target_membership.role == "admin" and current_membership.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace owners can remove admin members."
        )

    db.delete(target_membership)
    db.commit()
    return {"message": "Workspace member removed successfully."}
