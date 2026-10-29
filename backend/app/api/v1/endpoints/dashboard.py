from datetime import date
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.vehicle import Vehicle
from app.models.document import VehicleDocument
from app.models.task import RenewalTask
from app.schemas.dashboard import DashboardSummaryResponse, UrgentActionItem
from app.api.deps import get_current_user, get_current_workspace
from app.domain.rules import DOCUMENT_CATEGORIES
from app.services.expiry_engine import evaluate_vehicle_compliance, parse_thresholds

router = APIRouter()

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    vehicles = db.query(Vehicle).filter(
        Vehicle.workspace_id == workspace.id,
        Vehicle.is_archived == False
    ).all()

    thresholds = parse_thresholds(workspace.warning_threshold_days)
    today = date.today()

    total_vehicles = len(vehicles)
    needing_attention = 0
    total_upcoming_renewals = 0
    total_overdue_documents = 0
    attention_breakdown = {
        "CRITICAL": 0,
        "ATTENTION": 0,
        "INCOMPLETE": 0,
        "COMPLIANT": 0
    }

    urgent_actions: List[UrgentActionItem] = []
    evaluated_vehicles = []

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
        status_key = compliance["attention_status"]
        attention_breakdown[status_key] = attention_breakdown.get(status_key, 0) + 1

        if status_key in ["CRITICAL", "ATTENTION", "INCOMPLETE"]:
            needing_attention += 1

        total_overdue_documents += compliance["expired_count"]
        total_upcoming_renewals += compliance["due_soon_count"]

        # Urgent action collection from expired or due soon docs
        for doc_item in compliance["document_summaries"]:
            if doc_item["status"] == "EXPIRED":
                urgent_actions.append(UrgentActionItem(
                    id=f"exp-{doc_item.get('document', {}).get('id') if doc_item.get('document') else v.id}-{doc_item['category_code']}",
                    type="document_expiry",
                    title=f"Expired: {doc_item['category_name']}",
                    subtitle=f"{v.registration_number} ({v.make} {v.model})",
                    due_date=doc_item.get("document", {}).get("expiry_date") if doc_item.get("document") else None,
                    days_remaining=doc_item["days_remaining"],
                    urgency="critical",
                    vehicle_id=v.id,
                    vehicle_registration=v.registration_number,
                    document_id=doc_item.get("document", {}).get("id") if doc_item.get("document") else None
                ))
            elif doc_item["status"] == "DUE_SOON":
                urgent_actions.append(UrgentActionItem(
                    id=f"due-{doc_item.get('document', {}).get('id') if doc_item.get('document') else v.id}-{doc_item['category_code']}",
                    type="document_expiry",
                    title=f"Renewal Due: {doc_item['category_name']}",
                    subtitle=f"{v.registration_number} • {doc_item['label']}",
                    due_date=doc_item.get("document", {}).get("expiry_date") if doc_item.get("document") else None,
                    days_remaining=doc_item["days_remaining"],
                    urgency="warning",
                    vehicle_id=v.id,
                    vehicle_registration=v.registration_number,
                    document_id=doc_item.get("document", {}).get("id") if doc_item.get("document") else None
                ))

        evaluated_vehicles.append({
            "id": v.id,
            "registration_number": v.registration_number,
            "make": v.make,
            "model": v.model,
            "vehicle_category": v.vehicle_category,
            "attention_status": compliance["attention_status"],
            "status_label": compliance["status_label"],
            "updated_at": v.updated_at
        })

    # Add overdue & due tasks to urgent actions
    pending_tasks = db.query(RenewalTask).filter(
        RenewalTask.workspace_id == workspace.id,
        RenewalTask.status.in_(["pending", "in_progress"])
    ).order_by(RenewalTask.due_date.asc()).all()

    for t in pending_tasks:
        days_rem = (t.due_date - today).days if t.due_date else None
        if days_rem is not None and days_rem <= 7:
            veh_reg = None
            if t.vehicle_id:
                v_match = next((v for v in vehicles if v.id == t.vehicle_id), None)
                if v_match:
                    veh_reg = v_match.registration_number

            urgent_actions.append(UrgentActionItem(
                id=f"task-{t.id}",
                type="task_due",
                title=f"Task: {t.title}",
                subtitle=f"{veh_reg or 'Fleet task'} • Priority: {t.priority.upper()}",
                due_date=str(t.due_date),
                days_remaining=days_rem,
                urgency="critical" if days_rem < 0 else "warning",
                vehicle_id=t.vehicle_id,
                vehicle_registration=veh_reg,
                task_id=t.id
            ))

    # Sort urgent actions by urgency (critical first) then days remaining
    urgent_actions.sort(key=lambda x: (
        0 if x.urgency == "critical" else 1,
        x.days_remaining if x.days_remaining is not None else 9999
    ))

    # Recently updated vehicles
    evaluated_vehicles.sort(key=lambda x: x["updated_at"], reverse=True)

    return DashboardSummaryResponse(
        total_vehicles=total_vehicles,
        vehicles_needing_attention=needing_attention,
        upcoming_renewals=total_upcoming_renewals,
        overdue_documents=total_overdue_documents,
        pending_tasks=len(pending_tasks),
        attention_breakdown=attention_breakdown,
        urgent_actions=urgent_actions[:15], # top 15 most urgent actions
        recently_updated_vehicles=evaluated_vehicles[:5]
    )
