from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    business_type = Column(String(50), nullable=False, default="mixed_fleet") # travel_agency, goods_transport, mixed_fleet
    state_jurisdiction = Column(String(100), nullable=False, default="MH")
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(30), nullable=True)
    warning_threshold_days = Column(String(50), default="30,15,7,1") # Comma-separated thresholds
    settings_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    members = relationship("WorkspaceMembership", back_populates="workspace", cascade="all, delete-orphan")
    vehicles = relationship("Vehicle", back_populates="workspace", cascade="all, delete-orphan")
    drivers = relationship("Driver", back_populates="workspace", cascade="all, delete-orphan")
    tasks = relationship("RenewalTask", back_populates="workspace", cascade="all, delete-orphan")

class WorkspaceMembership(Base):
    __tablename__ = "workspace_memberships"

    id = Column(String(36), primary_key=True, index=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(30), nullable=False, default="staff") # owner, admin, manager, staff
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="memberships")
