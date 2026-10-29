from datetime import date, datetime
from typing import List, Optional, Dict, Any
from app.domain.rules import DOCUMENT_CATEGORIES, VEHICLE_CATEGORIES

def parse_thresholds(threshold_str: Optional[str]) -> List[int]:
    if not threshold_str:
        return [30, 15, 7, 1]
    try:
        return sorted([int(x.strip()) for x in threshold_str.split(",") if x.strip()], reverse=True)
    except Exception:
        return [30, 15, 7, 1]

def calculate_document_status(
    expiry_date: Optional[date],
    threshold_days: int = 30,
    reference_date: Optional[date] = None
) -> Dict[str, Any]:
    """Calculate status and remaining days for a document."""
    if reference_date is None:
        reference_date = date.today()

    if expiry_date is None:
        return {
            "status": "NO_EXPIRY",
            "label": "Recorded (No Expiry Date)",
            "days_remaining": None,
            "urgency": "warning",
            "is_expired": False,
            "is_due_soon": False
        }

    delta = (expiry_date - reference_date).days

    if delta < 0:
        days_abs = abs(delta)
        return {
            "status": "EXPIRED",
            "label": f"Expired {days_abs} day{'s' if days_abs != 1 else ''} ago",
            "days_remaining": delta,
            "urgency": "critical",
            "is_expired": True,
            "is_due_soon": False
        }
    elif delta == 0:
        return {
            "status": "DUE_SOON",
            "label": "Expires today",
            "days_remaining": 0,
            "urgency": "warning",
            "is_expired": False,
            "is_due_soon": True
        }
    elif delta <= threshold_days:
        return {
            "status": "DUE_SOON",
            "label": f"Expires in {delta} day{'s' if delta != 1 else ''}",
            "days_remaining": delta,
            "urgency": "warning",
            "is_expired": False,
            "is_due_soon": True
        }
    else:
        return {
            "status": "ACTIVE",
            "label": f"Valid for {delta} days",
            "days_remaining": delta,
            "urgency": "normal",
            "is_expired": False,
            "is_due_soon": False
        }

def get_applicable_doc_codes_for_vehicle(vehicle_category: str) -> List[str]:
    for cat in VEHICLE_CATEGORIES:
        if cat["code"] == vehicle_category:
            return cat["applicable_documents"]
    return ["RC", "INSURANCE", "PUC", "FITNESS", "PERMIT", "ROAD_TAX"]

def evaluate_vehicle_compliance(
    vehicle,
    documents: list,
    pending_tasks: list,
    thresholds: Optional[List[int]] = None
) -> Dict[str, Any]:
    """
    Evaluates the compliance state of a single vehicle across all applicable documents and tasks.
    """
    today = date.today()
    applicable_codes = get_applicable_doc_codes_for_vehicle(vehicle.vehicle_category)
    primary_threshold = thresholds[0] if thresholds else 30

    active_docs_by_cat = {}
    for doc in documents:
        if not doc.is_superseded:
            # If multiple active versions, take the one with the latest expiry
            existing = active_docs_by_cat.get(doc.category_code)
            if not existing or (doc.expiry_date and (not existing.expiry_date or doc.expiry_date > existing.expiry_date)):
                active_docs_by_cat[doc.category_code] = doc

    doc_summaries = []
    expired_count = 0
    due_soon_count = 0
    missing_count = 0
    valid_count = 0
    next_obligation = None

    for code in applicable_codes:
        cat_info = DOCUMENT_CATEGORIES.get(code, {
            "code": code,
            "name": code,
            "is_mandatory": True,
            "default_warning_days": primary_threshold
        })
        doc = active_docs_by_cat.get(code)

        if not doc:
            missing_count += 1
            doc_summaries.append({
                "category_code": code,
                "category_name": cat_info["name"],
                "is_mandatory": cat_info.get("is_mandatory", True),
                "status": "MISSING",
                "label": "Missing / Not Uploaded",
                "days_remaining": None,
                "urgency": "critical" if cat_info.get("is_mandatory", True) else "warning",
                "document": None
            })
        else:
            cat_threshold = cat_info.get("default_warning_days", primary_threshold)
            status_info = calculate_document_status(doc.expiry_date, cat_threshold, today)
            
            if status_info["status"] == "EXPIRED":
                expired_count += 1
            elif status_info["status"] == "DUE_SOON":
                due_soon_count += 1
            elif status_info["status"] == "NO_EXPIRY" and cat_info.get("is_mandatory", True) and code != "RC":
                # Mandatory certificates requiring periodic renewal must have a valid expiry date
                missing_count += 1
            else:
                valid_count += 1

            if doc.expiry_date and doc.expiry_date >= today:
                if next_obligation is None or doc.expiry_date < next_obligation["date"]:
                    next_obligation = {
                        "category_code": code,
                        "category_name": cat_info["name"],
                        "date": doc.expiry_date,
                        "days_remaining": (doc.expiry_date - today).days,
                        "document_id": doc.id
                    }

            doc_summaries.append({
                "category_code": code,
                "category_name": cat_info["name"],
                "is_mandatory": cat_info.get("is_mandatory", True),
                "status": status_info["status"],
                "label": status_info["label"],
                "days_remaining": status_info["days_remaining"],
                "urgency": status_info["urgency"],
                "document": {
                    "id": doc.id,
                    "document_number": doc.document_number,
                    "issuing_authority": doc.issuing_authority,
                    "issue_date": str(doc.issue_date) if doc.issue_date else None,
                    "expiry_date": str(doc.expiry_date) if doc.expiry_date else None,
                    "file_path": doc.file_path,
                    "file_name": doc.file_name,
                    "verification_status": doc.verification_status,
                }
            })

    # Determine overall vehicle attention status
    # Priority: Critical > Attention > Incomplete > Compliant
    if expired_count > 0:
        attention_status = "CRITICAL"
        status_label = f"{expired_count} Overdue Document{'s' if expired_count > 1 else ''}"
    elif due_soon_count > 0:
        attention_status = "ATTENTION"
        status_label = f"{due_soon_count} Renewal{'s' if due_soon_count > 1 else ''} Due Soon"
    elif missing_count > 0:
        attention_status = "INCOMPLETE"
        status_label = f"{missing_count} Document{'s' if missing_count > 1 else ''} Missing"
    else:
        attention_status = "COMPLIANT"
        status_label = "Fully Compliant"

    # Also check pending tasks
    overdue_tasks = [t for t in pending_tasks if t.due_date and t.due_date < today and t.status in ('pending', 'in_progress')]
    if overdue_tasks and attention_status != "CRITICAL":
        attention_status = "ATTENTION"
        status_label = f"{len(overdue_tasks)} Overdue Task{'s' if len(overdue_tasks) > 1 else ''}"

    return {
        "vehicle_id": vehicle.id,
        "registration_number": vehicle.registration_number,
        "attention_status": attention_status,
        "status_label": status_label,
        "expired_count": expired_count,
        "due_soon_count": due_soon_count,
        "missing_count": missing_count,
        "valid_count": valid_count,
        "next_obligation": next_obligation,
        "document_summaries": doc_summaries,
        "total_applicable": len(applicable_codes)
    }
