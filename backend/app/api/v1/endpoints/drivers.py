import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.vehicle import Vehicle
from app.models.driver import Driver, VehicleDriverAssignment
from app.models.document import DriverDocument
from app.schemas.driver import DriverCreate, DriverUpdate, DriverListItem, DriverDetailResponse
from app.api.deps import get_current_user, get_current_workspace, check_workspace_role
from app.services.expiry_engine import calculate_document_status

router = APIRouter()

@router.get("", response_model=List[DriverListItem])
def list_drivers(
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    query = db.query(Driver).filter(Driver.workspace_id == workspace.id)

    if status_filter:
        query = query.filter(Driver.status == status_filter)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            Driver.full_name.ilike(term) |
            Driver.licence_number.ilike(term) |
            Driver.phone.ilike(term)
        )

    drivers = query.order_by(Driver.full_name.asc()).all()
    today = date.today()

    results = []
    for d in drivers:
        # Check active vehicle assignment
        active_assignment = db.query(VehicleDriverAssignment).filter(
            VehicleDriverAssignment.driver_id == d.id,
            VehicleDriverAssignment.unassigned_at == None
        ).first()

        assigned_reg = None
        if active_assignment:
            veh = db.query(Vehicle).filter(Vehicle.id == active_assignment.vehicle_id).first()
            if veh:
                assigned_reg = veh.registration_number

        assignment_count = db.query(VehicleDriverAssignment).filter(
            VehicleDriverAssignment.driver_id == d.id,
            VehicleDriverAssignment.unassigned_at == None
        ).count()

        status_info = calculate_document_status(d.licence_expiry_date)

        results.append(DriverListItem(
            id=d.id,
            workspace_id=d.workspace_id,
            full_name=d.full_name,
            phone=d.phone,
            email=d.email,
            licence_number=d.licence_number,
            licence_category=d.licence_category,
            licence_expiry_date=d.licence_expiry_date,
            badge_number=d.badge_number,
            status=d.status,
            notes=d.notes,
            created_at=d.created_at,
            updated_at=d.updated_at,
            assigned_vehicles_count=assignment_count,
            assigned_vehicle_reg=assigned_reg,
            licence_status=status_info["status"],
            licence_status_label=status_info["label"],
            days_to_expiry=status_info["days_remaining"]
        ))

    return results

@router.post("", response_model=DriverListItem)
def create_driver(
    req: DriverCreate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    driver_id = str(uuid.uuid4())
    driver = Driver(
        id=driver_id,
        workspace_id=workspace.id,
        full_name=req.full_name.strip(),
        phone=req.phone.strip(),
        email=req.email.strip() if req.email else None,
        licence_number=req.licence_number.strip().upper(),
        licence_category=req.licence_category,
        licence_expiry_date=req.licence_expiry_date,
        badge_number=req.badge_number,
        status=req.status or "active",
        notes=req.notes
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)

    status_info = calculate_document_status(driver.licence_expiry_date)
    return DriverListItem(
        id=driver.id,
        workspace_id=driver.workspace_id,
        full_name=driver.full_name,
        phone=driver.phone,
        email=driver.email,
        licence_number=driver.licence_number,
        licence_category=driver.licence_category,
        licence_expiry_date=driver.licence_expiry_date,
        badge_number=driver.badge_number,
        status=driver.status,
        notes=driver.notes,
        created_at=driver.created_at,
        updated_at=driver.updated_at,
        assigned_vehicles_count=0,
        licence_status=status_info["status"],
        licence_status_label=status_info["label"],
        days_to_expiry=status_info["days_remaining"]
    )

@router.get("/{driver_id}", response_model=DriverDetailResponse)
def get_driver_detail(
    driver_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    driver = db.query(Driver).filter(
        Driver.id == driver_id,
        Driver.workspace_id == workspace.id
    ).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found.")

    assignments = db.query(VehicleDriverAssignment).filter(
        VehicleDriverAssignment.driver_id == driver.id
    ).order_by(VehicleDriverAssignment.assigned_at.desc()).all()

    assign_list = []
    primary_reg = None
    for a in assignments:
        v = db.query(Vehicle).filter(Vehicle.id == a.vehicle_id).first()
        if v:
            assign_list.append({
                "assignment_id": a.id,
                "vehicle_id": v.id,
                "vehicle_registration": v.registration_number,
                "make_model": f"{v.make} {v.model}",
                "is_primary": a.is_primary,
                "assigned_at": str(a.assigned_at),
                "unassigned_at": str(a.unassigned_at) if a.unassigned_at else None
            })
            if a.is_primary and not a.unassigned_at and not primary_reg:
                primary_reg = v.registration_number

    docs = db.query(DriverDocument).filter(
        DriverDocument.driver_id == driver.id,
        DriverDocument.workspace_id == workspace.id
    ).order_by(DriverDocument.created_at.desc()).all()

    doc_list = [{
        "id": d.id,
        "category_code": d.category_code,
        "document_number": d.document_number,
        "issuing_authority": d.issuing_authority,
        "issue_date": str(d.issue_date) if d.issue_date else None,
        "expiry_date": str(d.expiry_date) if d.expiry_date else None,
        "file_name": d.file_name,
        "verification_status": d.verification_status,
        "created_at": d.created_at
    } for d in docs]

    status_info = calculate_document_status(driver.licence_expiry_date)

    return DriverDetailResponse(
        id=driver.id,
        workspace_id=driver.workspace_id,
        full_name=driver.full_name,
        phone=driver.phone,
        email=driver.email,
        licence_number=driver.licence_number,
        licence_category=driver.licence_category,
        licence_expiry_date=driver.licence_expiry_date,
        badge_number=driver.badge_number,
        status=driver.status,
        notes=driver.notes,
        created_at=driver.created_at,
        updated_at=driver.updated_at,
        assigned_vehicles_count=len([a for a in assignments if not a.unassigned_at]),
        assigned_vehicle_reg=primary_reg,
        licence_status=status_info["status"],
        licence_status_label=status_info["label"],
        days_to_expiry=status_info["days_remaining"],
        documents=doc_list,
        assignments=assign_list,
        tasks=[]
    )

@router.put("/{driver_id}", response_model=DriverListItem)
def update_driver(
    driver_id: str,
    req: DriverUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    driver = db.query(Driver).filter(
        Driver.id == driver_id,
        Driver.workspace_id == workspace.id
    ).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found.")

    update_data = req.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(driver, field, val)

    db.commit()
    db.refresh(driver)

    status_info = calculate_document_status(driver.licence_expiry_date)
    return DriverListItem(
        id=driver.id,
        workspace_id=driver.workspace_id,
        full_name=driver.full_name,
        phone=driver.phone,
        email=driver.email,
        licence_number=driver.licence_number,
        licence_category=driver.licence_category,
        licence_expiry_date=driver.licence_expiry_date,
        badge_number=driver.badge_number,
        status=driver.status,
        notes=driver.notes,
        created_at=driver.created_at,
        updated_at=driver.updated_at,
        assigned_vehicles_count=0,
        licence_status=status_info["status"],
        licence_status_label=status_info["label"],
        days_to_expiry=status_info["days_remaining"]
    )

@router.post("/assign")
def assign_driver_to_vehicle(
    vehicle_id: str = Query(...),
    driver_id: str = Query(...),
    is_primary: bool = True,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    veh = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.workspace_id == workspace.id).first()
    drv = db.query(Driver).filter(Driver.id == driver_id, Driver.workspace_id == workspace.id).first()
    if not veh or not drv:
        raise HTTPException(status_code=404, detail="Vehicle or driver not found in workspace.")

    # If is_primary, unmark other primary assignments for this vehicle
    if is_primary:
        existing_primaries = db.query(VehicleDriverAssignment).filter(
            VehicleDriverAssignment.vehicle_id == vehicle_id,
            VehicleDriverAssignment.unassigned_at == None,
            VehicleDriverAssignment.is_primary == True
        ).all()
        for ep in existing_primaries:
            ep.is_primary = False

    assignment = VehicleDriverAssignment(
        id=str(uuid.uuid4()),
        workspace_id=workspace.id,
        vehicle_id=vehicle_id,
        driver_id=driver_id,
        is_primary=is_primary
    )
    db.add(assignment)
    db.commit()
    return {"message": "Driver assigned successfully."}

@router.delete("/{driver_id}")
def delete_driver(
    driver_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    drv = db.query(Driver).filter(
        Driver.id == driver_id,
        Driver.workspace_id == workspace.id
    ).first()
    if not drv:
        raise HTTPException(status_code=404, detail="Driver not found.")

    db.delete(drv)
    db.commit()
    return {"message": "Driver deleted successfully."}
