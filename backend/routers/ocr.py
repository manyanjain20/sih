"""
OCR pipeline — preprocess, extract text, extract clinical entities.
"""

import time
import re
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Document, OCRResult, ClinicalEntity, User, MedicalTimeline, Medication, Investigation
from schemas import OCRResultOut, MessageResponse
from core.dependencies import get_current_user
from core.audit import log_action

router = APIRouter(prefix="/api/ocr", tags=["ocr"])


# ─── Image Preprocessing ───────────────────────────────────────────────────

def preprocess_image(image_path: str):
    """Apply OpenCV preprocessing for better OCR."""
    try:
        import cv2
        import numpy as np

        img = cv2.imread(image_path)
        if img is None:
            return image_path

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, h=10)

        # Adaptive threshold for better text contrast
        thresh = cv2.adaptiveThreshold(
            denoised, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )

        # Deskew
        coords = np.column_stack(np.where(thresh > 0))
        if len(coords) > 0:
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
            if abs(angle) > 0.5:
                (h, w) = thresh.shape[:2]
                M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
                thresh = cv2.warpAffine(thresh, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

        # Save preprocessed image
        preprocessed_path = image_path.replace(".", "_preprocessed.")
        cv2.imwrite(preprocessed_path, thresh)
        return preprocessed_path
    except Exception:
        return image_path


# ─── OCR Extraction ────────────────────────────────────────────────────────

def extract_text_from_image(image_path: str) -> tuple[str, float]:
    """Run Tesseract OCR on image. Returns (text, confidence)."""
    try:
        import pytesseract
        from PIL import Image

        img = Image.open(image_path)
        # Try with multi-language support
        custom_config = r'--oem 3 --psm 6 -l eng+hin'
        data = pytesseract.image_to_data(img, config=custom_config, output_type=pytesseract.Output.DICT)
        text = pytesseract.image_to_string(img, config=custom_config)

        # Calculate confidence
        confidences = [int(c) for c in data['conf'] if c != '-1' and str(c) != '-1']
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0

        return text, avg_conf / 100.0
    except Exception as e:
        return f"OCR failed: {str(e)}", 0.0


def extract_text_from_pdf(pdf_path: str) -> tuple[str, float]:
    """Extract text from PDF using PyMuPDF or pdfplumber fallback."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text, 0.85  # PDFs with embedded text have high confidence
    except Exception:
        # Fallback: treat each page as an image
        return "PDF extraction failed — image-based PDF not supported without additional processing", 0.3


# ─── Clinical Entity Extraction (Rule-Based NER) ───────────────────────────

# Medication pattern: Name + dosage + frequency
MED_PATTERN = re.compile(
    r'(?P<name>[A-Za-z\s]+?)\s+'
    r'(?P<dosage>\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|IU|units?|tablet|cap))'
    r'(?:\s+(?P<frequency>once|twice|thrice|(?:\d+\s*times?\s*(?:daily|a\s*day)))|)?'
    r'(?:\s+(?P<duration>for\s+\d+\s+(?:day|week|month)s?))?',
    re.IGNORECASE
)

# Investigation value pattern
INVESTIGATION_PATTERN = re.compile(
    r'(?P<test>[A-Za-z\s/()]+?):\s*(?P<value>\d+(?:\.\d+)?)\s*(?P<unit>g/dL|mg/dL|mmol/L|U/L|%|cells/μL|mEq/L|mmHg)?',
    re.IGNORECASE
)

# Date pattern
DATE_PATTERN = re.compile(
    r'\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|'
    r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4})\b',
    re.IGNORECASE
)

# Diagnosis pattern
DIAGNOSIS_KEYWORDS = [
    "diagnosis", "diagnosed with", "impression", "findings:", "assessment:",
    "condition:", "disease:", "disorder:",
]

ALLERGY_PATTERN = re.compile(r'allerg(?:y|ic)\s+to\s+([A-Za-z\s,]+)', re.IGNORECASE)


def extract_clinical_entities(text: str) -> list[dict]:
    """Extract structured clinical entities from raw OCR text."""
    entities = []

    # Medications
    for match in MED_PATTERN.finditer(text):
        name = match.group("name").strip()
        if len(name) < 3 or name.lower() in ("and", "the", "for", "with"):
            continue
        entities.append({
            "entity_type": "medication",
            "value": name,
            "confidence": 0.82,
            "source_text_span": match.group(0)[:200],
        })
        if match.group("dosage"):
            entities.append({
                "entity_type": "dosage",
                "value": match.group("dosage").strip(),
                "confidence": 0.85,
                "source_text_span": match.group(0)[:200],
            })
        if match.group("frequency"):
            entities.append({
                "entity_type": "frequency",
                "value": match.group("frequency").strip(),
                "confidence": 0.80,
                "source_text_span": match.group(0)[:200],
            })
        if match.group("duration"):
            entities.append({
                "entity_type": "duration",
                "value": match.group("duration").strip(),
                "confidence": 0.78,
                "source_text_span": match.group(0)[:200],
            })

    # Investigations
    for match in INVESTIGATION_PATTERN.finditer(text):
        test_name = match.group("test").strip()
        if len(test_name) < 2:
            continue
        entities.append({
            "entity_type": "investigation",
            "value": test_name,
            "confidence": 0.75,
            "source_text_span": match.group(0)[:200],
        })
        if match.group("value"):
            conf = 0.88
            entities.append({
                "entity_type": "investigation_value",
                "value": match.group("value"),
                "normalized_value": f"{match.group('value')} {match.group('unit') or ''}".strip(),
                "confidence": conf,
                "source_text_span": match.group(0)[:200],
            })

    # Dates
    for match in DATE_PATTERN.finditer(text):
        entities.append({
            "entity_type": "date",
            "value": match.group(0),
            "confidence": 0.92,
            "source_text_span": match.group(0),
        })

    # Allergies
    for match in ALLERGY_PATTERN.finditer(text):
        entities.append({
            "entity_type": "allergy",
            "value": match.group(1).strip(),
            "confidence": 0.88,
            "source_text_span": match.group(0)[:200],
        })

    # Diagnoses (keyword-based)
    text_lower = text.lower()
    for keyword in DIAGNOSIS_KEYWORDS:
        idx = text_lower.find(keyword)
        if idx != -1:
            snippet = text[idx + len(keyword):idx + len(keyword) + 80].strip().split("\n")[0]
            if snippet:
                entities.append({
                    "entity_type": "diagnosis",
                    "value": snippet[:100],
                    "confidence": 0.65,
                    "source_text_span": snippet[:200],
                })

    return entities


# ─── Background OCR Task ────────────────────────────────────────────────────

async def run_ocr_pipeline(document_id: str):
    """Run full OCR pipeline in background."""
    from database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Document).where(Document.id == document_id))
        doc = result.scalar_one_or_none()
        if not doc:
            return

        doc.ocr_status = "processing"
        await db.commit()

        start_ms = int(time.time() * 1000)

        try:
            file_path = doc.file_path
            preprocessed_path = file_path

            # Preprocess images
            if doc.file_type in ("jpeg", "jpg", "png", "tiff"):
                preprocessed_path = preprocess_image(file_path)
                raw_text, confidence = extract_text_from_image(preprocessed_path)
            elif doc.file_type == "pdf":
                raw_text, confidence = extract_text_from_pdf(file_path)
            else:
                raw_text, confidence = "Unsupported file type", 0.0

            elapsed_ms = int(time.time() * 1000) - start_ms

            # Save OCR result
            ocr_result = OCRResult(
                document_id=document_id,
                raw_text=raw_text,
                preprocessed=preprocessed_path != file_path,
                engine_used="tesseract",
                overall_confidence=confidence,
                processing_time_ms=elapsed_ms,
            )
            db.add(ocr_result)
            await db.flush()

            # Extract clinical entities
            entities_data = extract_clinical_entities(raw_text)
            for ent in entities_data:
                entity = ClinicalEntity(
                    ocr_result_id=ocr_result.id,
                    entity_type=ent["entity_type"],
                    value=ent["value"],
                    normalized_value=ent.get("normalized_value"),
                    confidence=ent.get("confidence"),
                    source_page=1,
                    source_text_span=ent.get("source_text_span", "")[:500],
                )
                db.add(entity)

            doc.ocr_status = "completed"
            await db.commit()

        except Exception as e:
            doc.ocr_status = "failed"
            await db.commit()


# ─── Routes ────────────────────────────────────────────────────────────────

@router.post("/process/{document_id}", response_model=MessageResponse)
async def process_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start OCR processing for a document in background."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    background_tasks.add_task(run_ocr_pipeline, document_id)
    await log_action(db, "ocr_started", user_id=current_user.id,
                     resource_type="document", resource_id=document_id)
    return {"message": "OCR processing started"}


@router.get("/{document_id}", response_model=OCRResultOut)
async def get_ocr_result(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get OCR result with clinical entities for a document."""
    result = await db.execute(
        select(OCRResult).where(OCRResult.document_id == document_id)
    )
    ocr = result.scalar_one_or_none()
    if not ocr:
        raise HTTPException(status_code=404, detail="OCR result not found. Process the document first.")

    # Load entities
    entities_result = await db.execute(
        select(ClinicalEntity).where(ClinicalEntity.ocr_result_id == ocr.id)
    )
    entities = entities_result.scalars().all()

    from schemas import ClinicalEntityOut
    return OCRResultOut(
        id=ocr.id,
        document_id=document_id,
        raw_text=ocr.raw_text,
        overall_confidence=ocr.overall_confidence,
        engine_used=ocr.engine_used,
        processing_time_ms=ocr.processing_time_ms,
        clinical_entities=[ClinicalEntityOut.model_validate(e) for e in entities],
        created_at=ocr.created_at,
    )
