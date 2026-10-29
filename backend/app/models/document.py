from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Date, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class VehicleDocument(Base):
    __tablename__ = "vehicle_documents"

    id = Column(String(36), primary_key=True, index=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    category_code = Column(String(50), nullable=False, index=True) # RC, INSURANCE, PUC, FITNESS, PERMIT, ROAD_TAX, etc.
    document_number = Column(String(100), nullable=True)
    issuing_authority = Column(String(200), nullable=True) # e.g., RTO MH12 Pune, ICICI Lombard, ARAI
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True, index=True)
    file_path = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    verification_status = Column(String(30), default="pending", nullable=False) # pending, verified, rejected
    is_superseded = Column(Boolean, default=False, nullable=False)
    superseded_by_id = Column(String(36), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    vehicle = relationship("Vehicle", back_populates="documents")
    tasks = relationship("RenewalTask", back_populates="document")

class DriverDocument(Base):
    __tablename__ = "driver_documents"

    id = Column(String(36), primary_key=True, index=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    driver_id = Column(String(36), ForeignKey("drivers.id", ondelete="CASCADE"), nullable=False, index=True)
    category_code = Column(String(50), nullable=False, index=True) # DRIVING_LICENCE, BADGE, MEDICAL_CERT, POLICE_VERIFICATION
    document_number = Column(String(100), nullable=True)
    issuing_authority = Column(String(200), nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True, index=True)
    file_path = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    verification_status = Column(String(30), default="pending", nullable=False)
    is_superseded = Column(Boolean, default=False, nullable=False)
    superseded_by_id = Column(String(36), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    driver = relationship("Driver", back_populates="documents")
