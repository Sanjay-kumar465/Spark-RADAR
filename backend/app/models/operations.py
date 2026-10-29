from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Date, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class FASTagRecord(Base):
    __tablename__ = "fastag_records"

    id = Column(String(36), primary_key=True, index=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    tag_id = Column(String(100), nullable=False) # e.g. EPC / TID or Barcode
    issuer_bank = Column(String(100), nullable=False) # e.g. ICICI Bank, SBI, IDFC First, Paytm Payments
    recorded_status = Column(String(30), default="active", nullable=False) # active, low_balance, blacklisted, inactive
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    vehicle = relationship("Vehicle", back_populates="fastag_records")

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(String(36), primary_key=True, index=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    service_date = Column(Date, nullable=False, default=date.today)
    service_type = Column(String(100), nullable=False, default="Scheduled Service") # Scheduled Service, Brake Overhaul, Tyre Replacement, Engine Tuning, Oil Change
    description = Column(Text, nullable=False)
    odometer_km = Column(Integer, nullable=True)
    service_provider = Column(String(200), nullable=True) # e.g. Tata Authorized Service, Local Garage
    cost = Column(Float, nullable=True)
    bill_document_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    vehicle = relationship("Vehicle", back_populates="maintenance_records")
