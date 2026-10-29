from typing import List, Optional, Any
from pydantic import BaseModel

class MetricCard(BaseModel):
    title: str
    value: int
    subtitle: str
    urgency: str # critical, warning, normal, good
    trend: Optional[str] = None

class UrgentActionItem(BaseModel):
    id: str
    type: str # 'document_expiry', 'task_due', 'missing_document'
    title: str
    subtitle: str
    due_date: Optional[str] = None
    days_remaining: Optional[int] = None
    urgency: str # critical, warning
    vehicle_id: Optional[str] = None
    vehicle_registration: Optional[str] = None
    document_id: Optional[str] = None
    task_id: Optional[str] = None

class DashboardSummaryResponse(BaseModel):
    total_vehicles: int
    vehicles_needing_attention: int
    upcoming_renewals: int
    overdue_documents: int
    pending_tasks: int
    attention_breakdown: dict
    urgent_actions: List[UrgentActionItem]
    recently_updated_vehicles: List[Any]
