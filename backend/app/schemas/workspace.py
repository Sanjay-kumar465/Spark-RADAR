from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class WorkspaceBase(BaseModel):
    name: str
    business_type: str = "mixed_fleet"
    state_jurisdiction: str = "MH"
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    warning_threshold_days: Optional[str] = "30,15,7,1"

class WorkspaceCreate(WorkspaceBase):
    slug: Optional[str] = None

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    business_type: Optional[str] = None
    state_jurisdiction: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    warning_threshold_days: Optional[str] = None

class WorkspaceResponse(WorkspaceBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    role: Optional[str] = "owner"
    created_at: datetime
    updated_at: datetime

class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    role: str
    full_name: str
    email: str
    created_at: datetime

class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = "staff" # admin, manager, staff
    full_name: Optional[str] = None
    temporary_password: Optional[str] = None

class UpdateMemberRoleRequest(BaseModel):
    role: str # admin, manager, staff
