import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.vehicle import Vehicle
from app.models.operations import FASTagRecord, MaintenanceRecord
from app.schemas.operations import FASTagCreate, FASTagUpdate, FASTagResponse, MaintenanceCreate, MaintenanceResponse
from app.api.deps import get_current_user, get_current_workspace, check_workspace_role

router = APIRouter()

@router.get("/fastag/{vehicle_id}", response_model=List[FASTagResponse])
def get_vehicle_fastag(
    vehicle_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    return db.query(FASTagRecord).filter(
        FASTagRecord.vehicle_id == vehicle_id,
        FASTagRecord.workspace_id == workspace.id
    ).all()

@router.post("/fastag", response_model=FASTagResponse)
def create_fastag_record(
    req: FASTagCreate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    veh = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id, Vehicle.workspace_id == workspace.id).first()
    if not veh:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    record = FASTagRecord(
        id=str(uuid.uuid4()),
        workspace_id=workspace.id,
        vehicle_id=req.vehicle_id,
        tag_id=req.tag_id.strip(),
        issuer_bank=req.issuer_bank.strip(),
        recorded_status=req.recorded_status,
        notes=req.notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.put("/fastag/{record_id}", response_model=FASTagResponse)
def update_fastag_record(
    record_id: str,
    req: FASTagUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    rec = db.query(FASTagRecord).filter(
        FASTagRecord.id == record_id,
        FASTagRecord.workspace_id == workspace.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="FASTag record not found.")

    update_data = req.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(rec, field, val)

    db.commit()
    db.refresh(rec)
    return rec

@router.get("/maintenance/{vehicle_id}", response_model=List[MaintenanceResponse])
def get_vehicle_maintenance(
    vehicle_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    return db.query(MaintenanceRecord).filter(
        MaintenanceRecord.vehicle_id == vehicle_id,
        MaintenanceRecord.workspace_id == workspace.id
    ).order_by(MaintenanceRecord.service_date.desc()).all()

@router.post("/maintenance", response_model=MaintenanceResponse)
def create_maintenance_record(
    req: MaintenanceCreate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    veh = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id, Vehicle.workspace_id == workspace.id).first()
    if not veh:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    record = MaintenanceRecord(
        id=str(uuid.uuid4()),
        workspace_id=workspace.id,
        vehicle_id=req.vehicle_id,
        service_date=req.service_date,
        service_type=req.service_type,
        description=req.description.strip(),
        odometer_km=req.odometer_km,
        service_provider=req.service_provider,
        cost=req.cost
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
