from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"
    workspace: Optional["WorkspaceResponse"] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str
    workspace_name: Optional[str] = None
    business_type: Optional[str] = "mixed_fleet"
    state_jurisdiction: Optional[str] = "TN"

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    workspace_name: str
    business_type: str = "mixed_fleet" # travel_agency, goods_transport, mixed_fleet
    state_jurisdiction: str = "MH"
    initial_registration_number: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    is_active: bool

from app.schemas.workspace import WorkspaceResponse
Token.model_rebuild()
