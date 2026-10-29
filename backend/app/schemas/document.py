from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

class DocumentCreate(BaseModel):
    category_code: str
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    document_number: Optional[str] = None
    issuing_authority: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None
    replaces_document_id: Optional[str] = None

class DocumentUpdate(BaseModel):
    document_number: Optional[str] = None
    issuing_authority: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None
    verification_status: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str
    workspace_id: str
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    category_code: str
    category_name: Optional[str] = None
    document_number: Optional[str] = None
    issuing_authority: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    verification_status: str
    is_superseded: bool
    superseded_by_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    status: Optional[str] = None
    days_remaining: Optional[int] = None
    status_label: Optional[str] = None
    urgency: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
