import uuid
from datetime import datetime, date, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.document import VehicleDocument
from app.models.task import RenewalTask
from app.schemas.task import RenewalTaskCreate, RenewalTaskUpdate, RenewalTaskResponse
from app.api.deps import get_current_user, get_current_workspace, check_workspace_role

router = APIRouter()

@router.get("", response_model=List[RenewalTaskResponse])
def list_renewal_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    query = db.query(RenewalTask).filter(RenewalTask.workspace_id == workspace.id)

    if status_filter:
        query = query.filter(RenewalTask.status == status_filter)
    if priority:
        query = query.filter(RenewalTask.priority == priority)
    if vehicle_id:
        query = query.filter(RenewalTask.vehicle_id == vehicle_id)
    if assigned_to:
        query = query.filter(RenewalTask.assigned_to_user_id == assigned_to)

    tasks = query.order_by(RenewalTask.due_date.asc()).all()
    today = date.today()

    results = []
    for t in tasks:
        veh_reg = None
        if t.vehicle_id:
            v = db.query(Vehicle).filter(Vehicle.id == t.vehicle_id).first()
            if v:
                veh_reg = v.registration_number

        drv_name = None
        if t.driver_id:
            d = db.query(Driver).filter(Driver.id == t.driver_id).first()
            if d:
                drv_name = d.full_name

        assignee_name = None
        if t.assigned_to_user_id:
            u = db.query(User).filter(User.id == t.assigned_to_user_id).first()
            if u:
                assignee_name = u.full_name

        days_until_due = (t.due_date - today).days if t.due_date else None
        is_overdue = days_until_due is not None and days_until_due < 0 and t.status in ["pending", "in_progress"]

        results.append(RenewalTaskResponse(
            id=t.id,
            workspace_id=t.workspace_id,
            vehicle_id=t.vehicle_id,
            driver_id=t.driver_id,
            document_id=t.document_id,
            title=t.title,
            description=t.description,
            due_date=t.due_date,
            assigned_to_user_id=t.assigned_to_user_id,
            assigned_user_name=assignee_name,
            priority=t.priority,
            status=t.status,
            completion_notes=t.completion_notes,
            completion_evidence_path=t.completion_evidence_path,
            completed_at=t.completed_at,
            created_at=t.created_at,
            updated_at=t.updated_at,
            vehicle_registration=veh_reg,
            driver_name=drv_name,
            is_overdue=is_overdue,
            days_until_due=days_until_due
        ))

    return results

@router.post("", response_model=RenewalTaskResponse)
def create_renewal_task(
    req: RenewalTaskCreate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    if req.vehicle_id:
        v = db.query(Vehicle).filter(
            Vehicle.id == req.vehicle_id,
            Vehicle.workspace_id == workspace.id
        ).first()
        if not v:
            raise HTTPException(status_code=404, detail="Vehicle not found in this workspace.")

    if req.driver_id:
        d = db.query(Driver).filter(
            Driver.id == req.driver_id,
            Driver.workspace_id == workspace.id
        ).first()
        if not d:
            raise HTTPException(status_code=404, detail="Driver not found in this workspace.")

    if req.document_id:
        doc = db.query(VehicleDocument).filter(
            VehicleDocument.id == req.document_id,
            VehicleDocument.workspace_id == workspace.id
        ).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found in this workspace.")

    task_id = str(uuid.uuid4())
    task = RenewalTask(
        id=task_id,
        workspace_id=workspace.id,
        vehicle_id=req.vehicle_id,
        driver_id=req.driver_id,
        document_id=req.document_id,
        title=req.title.strip(),
        description=req.description,
        due_date=req.due_date,
        assigned_to_user_id=req.assigned_to_user_id,
        priority=req.priority,
        status="pending"
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Return populated task response
    veh_reg = None
    if task.vehicle_id:
        v = db.query(Vehicle).filter(Vehicle.id == task.vehicle_id).first()
        if v:
            veh_reg = v.registration_number

    assignee_name = None
    if task.assigned_to_user_id:
        u = db.query(User).filter(User.id == task.assigned_to_user_id).first()
        if u:
            assignee_name = u.full_name

    today = date.today()
    days_until_due = (task.due_date - today).days

    return RenewalTaskResponse(
        id=task.id,
        workspace_id=task.workspace_id,
        vehicle_id=task.vehicle_id,
        driver_id=task.driver_id,
        document_id=task.document_id,
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        assigned_to_user_id=task.assigned_to_user_id,
        assigned_user_name=assignee_name,
        priority=task.priority,
        status=task.status,
        created_at=task.created_at,
        updated_at=task.updated_at,
        vehicle_registration=veh_reg,
        is_overdue=days_until_due < 0,
        days_until_due=days_until_due
    )

@router.put("/{task_id}", response_model=RenewalTaskResponse)
def update_renewal_task(
    task_id: str,
    req: RenewalTaskUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager", "staff"])),
    db: Session = Depends(get_db)
):
    task = db.query(RenewalTask).filter(
        RenewalTask.id == task_id,
        RenewalTask.workspace_id == workspace.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    update_data = req.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] == "completed" and task.status != "completed":
        task.completed_at = datetime.now(timezone.utc)
    elif "status" in update_data and update_data["status"] != "completed":
        task.completed_at = None

    for field, val in update_data.items():
        setattr(task, field, val)

    db.commit()
    db.refresh(task)

    veh_reg = None
    if task.vehicle_id:
        v = db.query(Vehicle).filter(Vehicle.id == task.vehicle_id).first()
        if v:
            veh_reg = v.registration_number

    assignee_name = None
    if task.assigned_to_user_id:
        u = db.query(User).filter(User.id == task.assigned_to_user_id).first()
        if u:
            assignee_name = u.full_name

    today = date.today()
    days_until_due = (task.due_date - today).days

    return RenewalTaskResponse(
        id=task.id,
        workspace_id=task.workspace_id,
        vehicle_id=task.vehicle_id,
        driver_id=task.driver_id,
        document_id=task.document_id,
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        assigned_to_user_id=task.assigned_to_user_id,
        assigned_user_name=assignee_name,
        priority=task.priority,
        status=task.status,
        completion_notes=task.completion_notes,
        completed_at=task.completed_at,
        created_at=task.created_at,
        updated_at=task.updated_at,
        vehicle_registration=veh_reg,
        is_overdue=days_until_due < 0 and task.status in ["pending", "in_progress"],
        days_until_due=days_until_due
    )
