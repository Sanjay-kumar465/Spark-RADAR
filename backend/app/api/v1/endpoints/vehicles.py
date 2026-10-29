import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.models.vehicle import Vehicle
from app.models.driver import Driver, VehicleDriverAssignment
from app.models.document import VehicleDocument
from app.models.task import RenewalTask
from app.models.operations import FASTagRecord, MaintenanceRecord
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleListItem, VehicleDetailResponse
from app.api.deps import get_current_user, get_current_workspace, check_workspace_role
from app.domain.rules import normalize_registration_number, DOCUMENT_CATEGORIES
from app.services.expiry_engine import evaluate_vehicle_compliance, parse_thresholds

router = APIRouter()

@router.get("", response_model=List[VehicleListItem])
def list_vehicles(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    sort_by: Optional[str] = Query("next_expiry", pattern="^(next_expiry|registration|created_at)$"),
    include_archived: bool = False,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle).filter(Vehicle.workspace_id == workspace.id)
    if not include_archived:
        query = query.filter(Vehicle.is_archived == False)

    if category:
        query = query.filter(Vehicle.vehicle_category == category)

    if search:
        term = f"%{search.strip()}%"
        norm_term = f"%{normalize_registration_number(search)}%"
        query = query.filter(
            or_(
                Vehicle.registration_number.ilike(term),
                Vehicle.normalized_registration_number.ilike(norm_term),
                Vehicle.make.ilike(term),
                Vehicle.model.ilike(term)
            )
        )

    vehicles = query.all()
    thresholds = parse_thresholds(workspace.warning_threshold_days)

    results = []
    for v in vehicles:
        docs = db.query(VehicleDocument).filter(
            VehicleDocument.vehicle_id == v.id,
            VehicleDocument.workspace_id == workspace.id
        ).all()
        tasks = db.query(RenewalTask).filter(
            RenewalTask.vehicle_id == v.id,
            RenewalTask.workspace_id == workspace.id,
            RenewalTask.status.in_(["pending", "in_progress"])
        ).all()

        compliance = evaluate_vehicle_compliance(v, docs, tasks, thresholds)

        # Get assigned driver
        assignment = db.query(VehicleDriverAssignment).filter(
            VehicleDriverAssignment.vehicle_id == v.id,
            VehicleDriverAssignment.unassigned_at == None
        ).first()
        driver_name = None
        driver_id = None
        if assignment:
            drv = db.query(Driver).filter(Driver.id == assignment.driver_id).first()
            if drv:
                driver_name = drv.full_name
                driver_id = drv.id

        item = VehicleListItem(
            id=v.id,
            workspace_id=v.workspace_id,
            registration_number=v.registration_number,
            normalized_registration_number=v.normalized_registration_number,
            vehicle_category=v.vehicle_category,
            vehicle_use=v.vehicle_use,
            make=v.make,
            model=v.model,
            manufacturing_year=v.manufacturing_year,
            fuel_type=v.fuel_type,
            ownership_type=v.ownership_type,
            seating_capacity=v.seating_capacity,
            gross_vehicle_weight_kg=v.gross_vehicle_weight_kg,
            permit_type=v.permit_type,
            is_archived=v.is_archived,
            created_at=v.created_at,
            updated_at=v.updated_at,
            assigned_driver_name=driver_name,
            assigned_driver_id=driver_id,
            attention_status=compliance["attention_status"],
            status_label=compliance["status_label"],
            expired_count=compliance["expired_count"],
            due_soon_count=compliance["due_soon_count"],
            missing_count=compliance["missing_count"],
            valid_count=compliance["valid_count"],
            next_obligation=compliance["next_obligation"]
        )

        if not status_filter or compliance["attention_status"].upper() == status_filter.upper():
            results.append(item)

    # Sorting
    if sort_by == "registration":
        results.sort(key=lambda x: x.registration_number)
    elif sort_by == "created_at":
        results.sort(key=lambda x: x.created_at, reverse=True)
    elif sort_by == "next_expiry":
        # Sort critical first, then attention, then incomplete, then compliant
        status_priority = {"CRITICAL": 0, "ATTENTION": 1, "INCOMPLETE": 2, "COMPLIANT": 3}
        results.sort(key=lambda x: (
            status_priority.get(x.attention_status, 9),
            x.next_obligation["days_remaining"] if x.next_obligation and x.next_obligation["days_remaining"] is not None else 99999
        ))

    return results

@router.post("", response_model=VehicleDetailResponse)
def create_vehicle(
    req: VehicleCreate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    norm_reg = normalize_registration_number(req.registration_number)
    if not norm_reg:
        raise HTTPException(status_code=400, detail="Invalid registration number.")

    existing = db.query(Vehicle).filter(
        Vehicle.workspace_id == workspace.id,
        Vehicle.normalized_registration_number == norm_reg
    ).first()
    if existing:
        if existing.is_archived:
            raise HTTPException(
                status_code=400,
                detail=f"A vehicle with registration number '{req.registration_number}' is archived in this workspace. You can restore it from the archive."
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"A vehicle with registration number '{req.registration_number}' already exists in this workspace."
            )

    vehicle_id = str(uuid.uuid4())
    vehicle = Vehicle(
        id=vehicle_id,
        workspace_id=workspace.id,
        registration_number=req.registration_number.strip().upper(),
        normalized_registration_number=norm_reg,
        vehicle_category=req.vehicle_category,
        vehicle_use=req.vehicle_use,
        make=req.make.strip(),
        model=req.model.strip(),
        manufacturing_year=req.manufacturing_year,
        fuel_type=req.fuel_type,
        ownership_type=req.ownership_type,
        chassis_number=req.chassis_number,
        engine_number=req.engine_number,
        seating_capacity=req.seating_capacity,
        gross_vehicle_weight_kg=req.gross_vehicle_weight_kg,
        permit_type=req.permit_type,
        notes=req.notes
    )
    db.add(vehicle)

    # Assign initial driver if provided
    if req.assigned_driver_id:
        driver = db.query(Driver).filter(
            Driver.id == req.assigned_driver_id,
            Driver.workspace_id == workspace.id
        ).first()
        if driver:
            assign = VehicleDriverAssignment(
                id=str(uuid.uuid4()),
                workspace_id=workspace.id,
                vehicle_id=vehicle_id,
                driver_id=driver.id,
                is_primary=True
            )
            db.add(assign)

    db.commit()
    db.refresh(vehicle)
    return get_vehicle_detail(vehicle_id, workspace, db)

@router.get("/{vehicle_id}", response_model=VehicleDetailResponse)
def get_vehicle_detail(
    vehicle_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.workspace_id == workspace.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found in this workspace.")

    docs = db.query(VehicleDocument).filter(
        VehicleDocument.vehicle_id == v.id,
        VehicleDocument.workspace_id == workspace.id
    ).order_by(VehicleDocument.created_at.desc()).all()

    tasks = db.query(RenewalTask).filter(
        RenewalTask.vehicle_id == v.id,
        RenewalTask.workspace_id == workspace.id
    ).order_by(RenewalTask.due_date.asc()).all()

    fastags = db.query(FASTagRecord).filter(
        FASTagRecord.vehicle_id == v.id,
        FASTagRecord.workspace_id == workspace.id
    ).all()

    maintenance = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.vehicle_id == v.id,
        MaintenanceRecord.workspace_id == workspace.id
    ).order_by(MaintenanceRecord.service_date.desc()).all()

    assignments = db.query(VehicleDriverAssignment).filter(
        VehicleDriverAssignment.vehicle_id == v.id,
        VehicleDriverAssignment.workspace_id == workspace.id
    ).order_by(VehicleDriverAssignment.assigned_at.desc()).all()

    driver_details = []
    primary_driver_name = None
    primary_driver_id = None
    for a in assignments:
        drv = db.query(Driver).filter(Driver.id == a.driver_id).first()
        if drv:
            driver_details.append({
                "assignment_id": a.id,
                "driver_id": drv.id,
                "full_name": drv.full_name,
                "phone": drv.phone,
                "licence_number": drv.licence_number,
                "licence_expiry_date": str(drv.licence_expiry_date) if drv.licence_expiry_date else None,
                "is_primary": a.is_primary,
                "assigned_at": str(a.assigned_at),
                "unassigned_at": str(a.unassigned_at) if a.unassigned_at else None
            })
            if a.is_primary and not a.unassigned_at:
                primary_driver_name = drv.full_name
                primary_driver_id = drv.id

    thresholds = parse_thresholds(workspace.warning_threshold_days)
    pending_tasks = [t for t in tasks if t.status in ["pending", "in_progress"]]
    compliance = evaluate_vehicle_compliance(v, docs, pending_tasks, thresholds)

    doc_list = []
    for d in docs:
        cat_info = DOCUMENT_CATEGORIES.get(d.category_code, {})
        doc_list.append({
            "id": d.id,
            "category_code": d.category_code,
            "category_name": cat_info.get("name", d.category_code),
            "document_number": d.document_number,
            "issuing_authority": d.issuing_authority,
            "issue_date": str(d.issue_date) if d.issue_date else None,
            "expiry_date": str(d.expiry_date) if d.expiry_date else None,
            "file_path": d.file_path,
            "file_name": d.file_name,
            "verification_status": d.verification_status,
            "is_superseded": d.is_superseded,
            "superseded_by_id": d.superseded_by_id,
            "notes": d.notes,
            "created_at": d.created_at
        })

    task_list = []
    for t in tasks:
        task_list.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "due_date": str(t.due_date),
            "priority": t.priority,
            "status": t.status,
            "completion_notes": t.completion_notes,
            "completed_at": str(t.completed_at) if t.completed_at else None,
            "assigned_to_user_id": t.assigned_to_user_id,
            "document_id": t.document_id,
            "created_at": t.created_at
        })

    fastag_list = [{
        "id": f.id,
        "tag_id": f.tag_id,
        "issuer_bank": f.issuer_bank,
        "recorded_status": f.recorded_status,
        "notes": f.notes,
        "updated_at": f.updated_at
    } for f in fastags]

    maintenance_list = [{
        "id": m.id,
        "service_date": str(m.service_date),
        "service_type": m.service_type,
        "description": m.description,
        "odometer_km": m.odometer_km,
        "service_provider": m.service_provider,
        "cost": m.cost,
        "created_at": m.created_at
    } for m in maintenance]

    return VehicleDetailResponse(
        id=v.id,
        workspace_id=v.workspace_id,
        registration_number=v.registration_number,
        normalized_registration_number=v.normalized_registration_number,
        vehicle_category=v.vehicle_category,
        vehicle_use=v.vehicle_use,
        make=v.make,
        model=v.model,
        manufacturing_year=v.manufacturing_year,
        fuel_type=v.fuel_type,
        ownership_type=v.ownership_type,
        chassis_number=v.chassis_number,
        engine_number=v.engine_number,
        seating_capacity=v.seating_capacity,
        gross_vehicle_weight_kg=v.gross_vehicle_weight_kg,
        permit_type=v.permit_type,
        notes=v.notes,
        is_archived=v.is_archived,
        created_at=v.created_at,
        updated_at=v.updated_at,
        assigned_driver_name=primary_driver_name,
        assigned_driver_id=primary_driver_id,
        attention_status=compliance["attention_status"],
        status_label=compliance["status_label"],
        expired_count=compliance["expired_count"],
        due_soon_count=compliance["due_soon_count"],
        missing_count=compliance["missing_count"],
        valid_count=compliance["valid_count"],
        next_obligation=compliance["next_obligation"],
        document_summaries=compliance["document_summaries"],
        documents=doc_list,
        tasks=task_list,
        fastag_records=fastag_list,
        maintenance_records=maintenance_list,
        driver_assignments=driver_details
    )

@router.put("/{vehicle_id}", response_model=VehicleDetailResponse)
def update_vehicle(
    vehicle_id: str,
    req: VehicleUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.workspace_id == workspace.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    update_data = req.model_dump(exclude_unset=True)
    if "registration_number" in update_data and update_data["registration_number"]:
        norm_reg = normalize_registration_number(update_data["registration_number"])
        if norm_reg != v.normalized_registration_number:
            existing = db.query(Vehicle).filter(
                Vehicle.workspace_id == workspace.id,
                Vehicle.normalized_registration_number == norm_reg,
                Vehicle.id != v.id,
                Vehicle.is_archived == False
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Another vehicle with this registration number already exists.")
            v.normalized_registration_number = norm_reg
            v.registration_number = update_data["registration_number"].strip().upper()
        del update_data["registration_number"]

    for field, val in update_data.items():
        setattr(v, field, val)

    db.commit()
    db.refresh(v)
    return get_vehicle_detail(v.id, workspace, db)

@router.delete("/{vehicle_id}")
def archive_vehicle(
    vehicle_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.workspace_id == workspace.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    v.is_archived = True
    db.commit()
    return {"message": "Vehicle archived successfully."}

@router.post("/{vehicle_id}/unarchive", response_model=VehicleDetailResponse)
def unarchive_vehicle(
    vehicle_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.workspace_id == workspace.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    v.is_archived = False
    db.commit()
    db.refresh(v)
    return get_vehicle_detail(v.id, workspace, db)

@router.post("/{vehicle_id}/assign-driver", response_model=VehicleDetailResponse)
def assign_driver_to_vehicle(
    vehicle_id: str,
    driver_id: str = Query(...),
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.workspace_id == workspace.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    driver = db.query(Driver).filter(
        Driver.id == driver_id,
        Driver.workspace_id == workspace.id
    ).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found in this workspace.")

    # Unassign current primary active assignments
    active_assignments = db.query(VehicleDriverAssignment).filter(
        VehicleDriverAssignment.vehicle_id == v.id,
        VehicleDriverAssignment.unassigned_at == None
    ).all()
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    for a in active_assignments:
        a.unassigned_at = now

    # Create new primary assignment
    new_assign = VehicleDriverAssignment(
        id=str(uuid.uuid4()),
        workspace_id=workspace.id,
        vehicle_id=v.id,
        driver_id=driver.id,
        is_primary=True
    )
    db.add(new_assign)
    db.commit()
    return get_vehicle_detail(v.id, workspace, db)

@router.post("/{vehicle_id}/unassign-driver", response_model=VehicleDetailResponse)
def unassign_driver_from_vehicle(
    vehicle_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.workspace_id == workspace.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    active_assignments = db.query(VehicleDriverAssignment).filter(
        VehicleDriverAssignment.vehicle_id == v.id,
        VehicleDriverAssignment.unassigned_at == None
    ).all()
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    for a in active_assignments:
        a.unassigned_at = now

    db.commit()
    return get_vehicle_detail(v.id, workspace, db)
