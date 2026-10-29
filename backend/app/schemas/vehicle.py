from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class VehicleBase(BaseModel):
    registration_number: str
    vehicle_category: str # sedan_taxi, suv_commercial, tempo_traveller, bus, mini_truck, goods_truck, multi_axle_trailer, tanker, tipper, container
    vehicle_use: str = "passenger_commercial"
    make: str
    model: str
    manufacturing_year: Optional[int] = None
    fuel_type: Optional[str] = "Diesel"
    ownership_type: Optional[str] = "Owned"
    chassis_number: Optional[str] = None
    engine_number: Optional[str] = None
    seating_capacity: Optional[int] = None
    gross_vehicle_weight_kg: Optional[int] = None
    permit_type: Optional[str] = None
    notes: Optional[str] = None

class VehicleCreate(VehicleBase):
    assigned_driver_id: Optional[str] = None

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    vehicle_category: Optional[str] = None
    vehicle_use: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    manufacturing_year: Optional[int] = None
    fuel_type: Optional[str] = None
    ownership_type: Optional[str] = None
    chassis_number: Optional[str] = None
    engine_number: Optional[str] = None
    seating_capacity: Optional[int] = None
    gross_vehicle_weight_kg: Optional[int] = None
    permit_type: Optional[str] = None
    notes: Optional[str] = None
    is_archived: Optional[bool] = None

class VehicleListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    registration_number: str
    normalized_registration_number: str
    vehicle_category: str
    vehicle_use: str
    make: str
    model: str
    manufacturing_year: Optional[int] = None
    fuel_type: Optional[str] = None
    ownership_type: Optional[str] = None
    seating_capacity: Optional[int] = None
    gross_vehicle_weight_kg: Optional[int] = None
    permit_type: Optional[str] = None
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    assigned_driver_name: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    attention_status: str = "COMPLIANT" # CRITICAL, ATTENTION, INCOMPLETE, COMPLIANT
    status_label: str = "Fully Compliant"
    expired_count: int = 0
    due_soon_count: int = 0
    missing_count: int = 0
    valid_count: int = 0
    next_obligation: Optional[Any] = None

class VehicleDetailResponse(VehicleListItem):
    chassis_number: Optional[str] = None
    engine_number: Optional[str] = None
    notes: Optional[str] = None
    document_summaries: List[Any] = []
    documents: List[Any] = []
    tasks: List[Any] = []
    fastag_records: List[Any] = []
    maintenance_records: List[Any] = []
    driver_assignments: List[Any] = []
