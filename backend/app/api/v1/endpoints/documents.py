import os
import uuid
import aiofiles
from datetime import date, datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.vehicle import Vehicle
from app.models.document import VehicleDocument, DriverDocument
from app.models.task import RenewalTask
from app.schemas.document import DocumentResponse, DocumentUpdate
from app.api.deps import get_current_user, get_current_workspace, check_workspace_role
from app.domain.rules import DOCUMENT_CATEGORIES
from app.services.expiry_engine import calculate_document_status

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15MB

def validate_magic_bytes(content: bytes, content_type: str) -> bool:
    """Verifies that the content matches authentic magic byte signatures."""
    if len(content) < 4:
        return False
    if content_type == "application/pdf":
        return content.startswith(b"%PDF-")
    elif content_type in ("image/jpeg", "image/jpg"):
        return content.startswith(b"\xff\xd8\xff")
    elif content_type == "image/png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    return False

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    category_code: str = Form(...),
    vehicle_id: Optional[str] = Form(None),
    driver_id: Optional[str] = Form(None),
    document_number: Optional[str] = Form(None),
    issuing_authority: Optional[str] = Form(None),
    issue_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    replaces_document_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    if not vehicle_id and not driver_id:
        raise HTTPException(status_code=400, detail="Document must be associated with a vehicle or a driver.")

    parsed_issue_date = date.fromisoformat(issue_date) if issue_date else None
    parsed_expiry_date = date.fromisoformat(expiry_date) if expiry_date else None

    # Handle file upload if provided
    file_path = None
    file_name = None
    file_size = None
    mime_type = None

    if file:
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{file.content_type}'. Allowed types: PDF, JPG, PNG."
            )

        content = await file.read()
        file_size = len(content)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds maximum allowed limit of 15MB.")

        if not validate_magic_bytes(content, file.content_type):
            raise HTTPException(
                status_code=400,
                detail="File content does not match the expected PDF/JPG/PNG signature."
            )

        file_ext = ALLOWED_MIME_TYPES[file.content_type]
        doc_uuid = str(uuid.uuid4())
        
        # Secure storage directory preventing path traversal
        target_dir = os.path.join(settings.STORAGE_DIR, "documents", workspace.id)
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, f"{doc_uuid}{file_ext}")

        async with aiofiles.open(target_path, "wb") as out_file:
            await out_file.write(content)

        file_path = target_path
        # Sanitize filename
        safe_filename = os.path.basename(file.filename.replace("\\", "/")) if file.filename else f"{doc_uuid}{file_ext}"
        file_name = safe_filename[:120]
        mime_type = file.content_type
    else:
        doc_uuid = str(uuid.uuid4())

    doc_id = doc_uuid

    try:
        if vehicle_id:
            vehicle = db.query(Vehicle).filter(
                Vehicle.id == vehicle_id,
                Vehicle.workspace_id == workspace.id
            ).first()
            if not vehicle:
                raise HTTPException(status_code=404, detail="Vehicle not found in this workspace.")

            # If this is replacing an existing document, supersede the old one
            if replaces_document_id:
                old_doc = db.query(VehicleDocument).filter(
                    VehicleDocument.id == replaces_document_id,
                    VehicleDocument.workspace_id == workspace.id
                ).first()
                if old_doc:
                    old_doc.is_superseded = True
                    old_doc.superseded_by_id = doc_id

            new_doc = VehicleDocument(
                id=doc_id,
                workspace_id=workspace.id,
                vehicle_id=vehicle_id,
                category_code=category_code.upper(),
                document_number=document_number.strip() if document_number else None,
                issuing_authority=issuing_authority.strip() if issuing_authority else None,
                issue_date=parsed_issue_date,
                expiry_date=parsed_expiry_date,
                file_path=file_path,
                file_name=file_name,
                file_size=file_size,
                mime_type=mime_type,
                notes=notes,
                verification_status="verified" if file_path else "pending"
            )
            db.add(new_doc)
            db.commit()
            db.refresh(new_doc)

            cat_info = DOCUMENT_CATEGORIES.get(new_doc.category_code, {})
            status_info = calculate_document_status(new_doc.expiry_date)

            return DocumentResponse(
                id=new_doc.id,
                workspace_id=new_doc.workspace_id,
                vehicle_id=new_doc.vehicle_id,
                category_code=new_doc.category_code,
                category_name=cat_info.get("name", new_doc.category_code),
                document_number=new_doc.document_number,
                issuing_authority=new_doc.issuing_authority,
                issue_date=new_doc.issue_date,
                expiry_date=new_doc.expiry_date,
                file_path=new_doc.file_path,
                file_name=new_doc.file_name,
                file_size=new_doc.file_size,
                mime_type=new_doc.mime_type,
                verification_status=new_doc.verification_status,
                is_superseded=new_doc.is_superseded,
                superseded_by_id=new_doc.superseded_by_id,
                notes=new_doc.notes,
                created_at=new_doc.created_at,
                updated_at=new_doc.updated_at,
                status=status_info["status"],
                days_remaining=status_info["days_remaining"],
                status_label=status_info["label"],
                urgency=status_info["urgency"]
            )
        else:
            # Driver document - verify driver belongs to this workspace
            driver = db.query(Driver).filter(
                Driver.id == driver_id,
                Driver.workspace_id == workspace.id
            ).first()
            if not driver:
                raise HTTPException(status_code=404, detail="Driver not found in this workspace.")

            if replaces_document_id:
                old_drv_doc = db.query(DriverDocument).filter(
                    DriverDocument.id == replaces_document_id,
                    DriverDocument.workspace_id == workspace.id
                ).first()
                if old_drv_doc:
                    old_drv_doc.is_superseded = True
                    old_drv_doc.superseded_by_id = doc_id

            new_doc = DriverDocument(
                id=doc_id,
                workspace_id=workspace.id,
                driver_id=driver_id,
                category_code=category_code.upper(),
                document_number=document_number.strip() if document_number else None,
                issuing_authority=issuing_authority.strip() if issuing_authority else None,
                issue_date=parsed_issue_date,
                expiry_date=parsed_expiry_date,
                file_path=file_path,
                file_name=file_name,
                file_size=file_size,
                mime_type=mime_type,
                notes=notes,
                verification_status="verified" if file_path else "pending"
            )
            db.add(new_doc)
            db.commit()
            db.refresh(new_doc)

            cat_info = DOCUMENT_CATEGORIES.get(new_doc.category_code, {})
            status_info = calculate_document_status(new_doc.expiry_date)

            return DocumentResponse(
                id=new_doc.id,
                workspace_id=new_doc.workspace_id,
                driver_id=new_doc.driver_id,
                category_code=new_doc.category_code,
                category_name=cat_info.get("name", new_doc.category_code),
                document_number=new_doc.document_number,
                issuing_authority=new_doc.issuing_authority,
                issue_date=new_doc.issue_date,
                expiry_date=new_doc.expiry_date,
                file_path=new_doc.file_path,
                file_name=new_doc.file_name,
                file_size=new_doc.file_size,
                mime_type=new_doc.mime_type,
                verification_status=new_doc.verification_status,
                is_superseded=new_doc.is_superseded,
                superseded_by_id=new_doc.superseded_by_id,
                notes=new_doc.notes,
                created_at=new_doc.created_at,
                updated_at=new_doc.updated_at,
                status=status_info["status"],
                days_remaining=status_info["days_remaining"],
                status_label=status_info["label"],
                urgency=status_info["urgency"]
            )
    except HTTPException:
        # Re-raise explicit HTTP exceptions and clean up file
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        raise
    except Exception as e:
        db.rollback()
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail="Failed to store document record.")

@router.get("/{document_id}/download")
def download_document(
    document_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    doc = db.query(VehicleDocument).filter(
        VehicleDocument.id == document_id,
        VehicleDocument.workspace_id == workspace.id
    ).first()

    if not doc:
        doc = db.query(DriverDocument).filter(
            DriverDocument.id == document_id,
            DriverDocument.workspace_id == workspace.id
        ).first()

    if not doc or not doc.file_path:
        raise HTTPException(status_code=404, detail="Document record or file reference not found.")

    real_storage = os.path.abspath(settings.STORAGE_DIR)
    real_file = os.path.abspath(doc.file_path)
    if not real_file.startswith(real_storage):
        raise HTTPException(status_code=403, detail="Access denied.")

    if not os.path.exists(real_file):
        raise HTTPException(status_code=404, detail="Document file not found on disk.")

    return FileResponse(
        path=doc.file_path,
        filename=doc.file_name or f"document-{doc.id}",
        media_type=doc.mime_type or "application/octet-stream"
    )

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(check_workspace_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    doc = db.query(VehicleDocument).filter(
        VehicleDocument.id == document_id,
        VehicleDocument.workspace_id == workspace.id
    ).first()
    if doc:
        db.delete(doc)
        db.commit()
        return {"message": "Document deleted."}

    drv_doc = db.query(DriverDocument).filter(
        DriverDocument.id == document_id,
        DriverDocument.workspace_id == workspace.id
    ).first()
    if drv_doc:
        db.delete(drv_doc)
        db.commit()
        return {"message": "Driver document deleted."}

    raise HTTPException(status_code=404, detail="Document not found.")
