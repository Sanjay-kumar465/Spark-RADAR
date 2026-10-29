from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"
    __table_args__ = (
        UniqueConstraint('workspace_id', 'normalized_registration_number', name='uq_workspace_vehicle_reg'),
    )

    id = Column(String(36), primary_key=True, index=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    registration_number = Column(String(50), nullable=False)
    normalized_registration_number = Column(String(50), nullable=False, index=True)
    vehicle_category = Column(String(50), nullable=False) # e.g., taxi, bus, tempo_traveller, lorry, etc.
    vehicle_use = Column(String(50), nullable=False, default="commercial")
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    manufacturing_year = Column(Integer, nullable=True)
    fuel_type = Column(String(30), nullable=True, default="Diesel")
    ownership_type = Column(String(50), nullable=True, default="Owned")
    chassis_number = Column(String(100), nullable=True)
    engine_number = Column(String(100), nullable=True)
    seating_capacity = Column(Integer, nullable=True)
    gross_vehicle_weight_kg = Column(Integer, nullable=True)
    permit_type = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    is_archived = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="vehicles")
    documents = relationship("VehicleDocument", back_populates="vehicle", cascade="all, delete-orphan")
    driver_assignments = relationship("VehicleDriverAssignment", back_populates="vehicle", cascade="all, delete-orphan")
    tasks = relationship("RenewalTask", back_populates="vehicle", cascade="all, delete-orphan")
    fastag_records = relationship("FASTagRecord", back_populates="vehicle", cascade="all, delete-orphan")
    maintenance_records = relationship("MaintenanceRecord", back_populates="vehicle", cascade="all, delete-orphan")
