from typing import Optional, List, Any
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

class DriverBase(BaseModel):
    full_name: str
    phone: str
    email: Optional[str] = None
    licence_number: str
    licence_category: Optional[str] = "LMV-TR"
    licence_expiry_date: Optional[date] = None
    badge_number: Optional[str] = None
    status: Optional[str] = "active"
    notes: Optional[str] = None

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    licence_number: Optional[str] = None
    licence_category: Optional[str] = None
    licence_expiry_date: Optional[date] = None
    badge_number: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class DriverListItem(DriverBase):
    id: str
    workspace_id: str
    created_at: datetime
    updated_at: datetime
    assigned_vehicles_count: int = 0
    assigned_vehicle_reg: Optional[str] = None
    licence_status: str = "ACTIVE"
    licence_status_label: str = "Valid"
    days_to_expiry: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class DriverDetailResponse(DriverListItem):
    documents: List[Any] = []
    assignments: List[Any] = []
    tasks: List[Any] = []
