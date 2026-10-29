from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class RenewalTask(Base):
    __tablename__ = "renewal_tasks"

    id = Column(String(36), primary_key=True, index=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=True, index=True)
    driver_id = Column(String(36), ForeignKey("drivers.id", ondelete="CASCADE"), nullable=True, index=True)
    document_id = Column(String(36), ForeignKey("vehicle_documents.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=False, index=True)
    assigned_to_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    priority = Column(String(20), default="medium", nullable=False) # low, medium, high, urgent
    status = Column(String(20), default="pending", nullable=False) # pending, in_progress, completed, cancelled
    
    completion_notes = Column(Text, nullable=True)
    completion_evidence_path = Column(String(500), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="tasks")
    vehicle = relationship("Vehicle", back_populates="tasks")
    driver = relationship("Driver", back_populates="tasks")
    document = relationship("VehicleDocument", back_populates="tasks")
    assigned_user = relationship("User")
