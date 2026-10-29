from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Date, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(String(36), primary_key=True, index=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=False)
    email = Column(String(255), nullable=True)
    licence_number = Column(String(100), nullable=False, index=True)
    licence_category = Column(String(50), nullable=True, default="LMV-TR") # LMV, LMV-TR, HMV, TRANS, PSV
    licence_expiry_date = Column(Date, nullable=True)
    badge_number = Column(String(100), nullable=True)
    status = Column(String(30), nullable=False, default="active") # active, inactive, suspended
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="drivers")
    vehicle_assignments = relationship("VehicleDriverAssignment", back_populates="driver", cascade="all, delete-orphan")
    documents = relationship("DriverDocument", back_populates="driver", cascade="all, delete-orphan")
    tasks = relationship("RenewalTask", back_populates="driver", cascade="all, delete-orphan")

class VehicleDriverAssignment(Base):
    __tablename__ = "vehicle_driver_assignments"

    id = Column(String(36), primary_key=True, index=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    driver_id = Column(String(36), ForeignKey("drivers.id", ondelete="CASCADE"), nullable=False, index=True)
    is_primary = Column(Boolean, default=True)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    unassigned_at = Column(DateTime, nullable=True)

    vehicle = relationship("Vehicle", back_populates="driver_assignments")
    driver = relationship("Driver", back_populates="vehicle_assignments")
