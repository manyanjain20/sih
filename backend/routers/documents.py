"""
Document upload and management router.
"""

import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Document, User
from schemas import DocumentOut, MessageResponse
from core.dependencies import get_current_user
from core.audit import log_action
from config import settings

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_TYPES = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/jpg": "jpg",
    "application/pdf": "pdf",
    "image/tiff": "tiff",
}


@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    patient_id: str = Form(...),
    session_id: str = Form(None),
    document_type: str = Form("other"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a medical document (image or PDF)."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"File type {file.content_type} not supported")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File too large. Max {settings.MAX_UPLOAD_SIZE_MB}MB")

    ext = ALLOWED_TYPES[file.content_type]
    unique_name = f"{uuid.uuid4()}.{ext}"
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / unique_name

    with open(file_path, "wb") as f:
        f.write(contents)

    doc = Document(
        patient_id=patient_id,
        session_id=session_id,
        filename=unique_name,
        original_filename=file.filename,
        file_path=str(file_path),
        file_type=ext,
        file_size_bytes=len(contents),
        document_type=document_type,
        ocr_status="pending",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    await log_action(db, "document_uploaded", user_id=current_user.id,
                     resource_type="document", resource_id=doc.id,
                     details={"filename": file.filename, "size": len(contents)})

    return DocumentOut.model_validate(doc)


@router.get("/{document_id}", response_model=DocumentOut)
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentOut.model_validate(doc)


@router.get("/{document_id}/file")
async def download_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download original document file."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not Path(doc.file_path).exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(doc.file_path, filename=doc.original_filename)


@router.delete("/{document_id}", response_model=MessageResponse)
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = Path(doc.file_path)
    if file_path.exists():
        file_path.unlink()

    await db.delete(doc)
    await db.commit()
    await log_action(db, "document_deleted", user_id=current_user.id,
                     resource_type="document", resource_id=document_id)
    return {"message": "Document deleted"}
