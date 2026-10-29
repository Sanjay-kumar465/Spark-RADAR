from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

class FASTagCreate(BaseModel):
    vehicle_id: str
    tag_id: str
    issuer_bank: str
    recorded_status: str = "active" # active, low_balance, blacklisted, inactive
    notes: Optional[str] = None

class FASTagUpdate(BaseModel):
    tag_id: Optional[str] = None
    issuer_bank: Optional[str] = None
    recorded_status: Optional[str] = None
    notes: Optional[str] = None

class FASTagResponse(BaseModel):
    id: str
    workspace_id: str
    vehicle_id: str
    tag_id: str
    issuer_bank: str
    recorded_status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MaintenanceCreate(BaseModel):
    vehicle_id: str
    service_date: date
    service_type: str = "Scheduled Service"
    description: str
    odometer_km: Optional[int] = None
    service_provider: Optional[str] = None
    cost: Optional[float] = None

class MaintenanceResponse(BaseModel):
    id: str
    workspace_id: str
    vehicle_id: str
    service_date: date
    service_type: str
    description: str
    odometer_km: Optional[int] = None
    service_provider: Optional[str] = None
    cost: Optional[float] = None
    bill_document_path: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
