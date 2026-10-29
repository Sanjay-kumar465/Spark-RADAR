from typing import Optional, Any
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

class RenewalTaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: date
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    document_id: Optional[str] = None
    assigned_to_user_id: Optional[str] = None
    priority: str = "medium" # low, medium, high, urgent

class RenewalTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    assigned_to_user_id: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None # pending, in_progress, completed, cancelled
    completion_notes: Optional[str] = None

class RenewalTaskResponse(BaseModel):
    id: str
    workspace_id: str
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    document_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    due_date: date
    assigned_to_user_id: Optional[str] = None
    assigned_user_name: Optional[str] = None
    priority: str
    status: str
    completion_notes: Optional[str] = None
    completion_evidence_path: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    vehicle_registration: Optional[str] = None
    driver_name: Optional[str] = None
    is_overdue: bool = False
    days_until_due: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
