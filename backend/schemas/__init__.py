"""
Pydantic schemas for all MediKiosk API endpoints.
"""

from __future__ import annotations
from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, validator


# ─── Generic ───────────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[Any]


# ─── Auth ──────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=15)


class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str


class DemoLoginRequest(BaseModel):
    role: str = Field(..., pattern="^(patient|doctor|nurse|admin)$")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    name: Optional[str]


# ─── User ──────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    mobile: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: str = "patient"


class UserCreate(UserBase):
    pass


class UserOut(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Patient ───────────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    full_name: str
    mobile: str
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None


class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    known_allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None


class PatientOut(BaseModel):
    id: str
    user_id: str
    age: Optional[int]
    gender: Optional[str]
    blood_group: Optional[str]
    full_name: Optional[str]
    mobile: Optional[str]
    known_allergies: List[str] = []
    chronic_conditions: List[str] = []

    class Config:
        from_attributes = True


# ─── Session ───────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    patient_id: str
    language_code: str = "en"


class SessionOut(BaseModel):
    id: str
    patient_id: str
    language_code: str
    status: str
    priority: str
    chief_complaint: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Consent ───────────────────────────────────────────────────────────────

class ConsentCreate(BaseModel):
    session_id: str
    given: bool


class ConsentOut(BaseModel):
    id: str
    session_id: str
    given: bool
    timestamp: datetime
    consent_text_version: str

    class Config:
        from_attributes = True


# ─── Conversation / Questions ───────────────────────────────────────────────

class AnswerRequest(BaseModel):
    session_id: str
    question_key: str
    input_method: str = "touch"  # voice | touch | text
    text_value: Optional[str] = None
    structured_value: Optional[Any] = None
    numeric_value: Optional[float] = None
    raw_transcript: Optional[str] = None
    asr_confidence: Optional[float] = None


class NextQuestionResponse(BaseModel):
    question_key: str
    question_text: str
    control_type: str
    options: Optional[List[Any]] = None
    category: str
    subcategory: Optional[str] = None
    is_last: bool = False
    audio_url: Optional[str] = None


class ConversationCompleteResponse(BaseModel):
    session_id: str
    questions_answered: int
    chief_complaint: Optional[str]
    message: str


# ─── SOCRATES ──────────────────────────────────────────────────────────────

class SocratesCreate(BaseModel):
    session_id: str
    site: Optional[str] = None
    onset: Optional[str] = None
    character: Optional[str] = None
    radiation: Optional[str] = None
    associated_symptoms: List[str] = []
    timing: Optional[str] = None
    exacerbating_factors: List[str] = []
    relieving_factors: List[str] = []
    severity: Optional[int] = Field(None, ge=0, le=10)


class SocratesOut(SocratesCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dashavidha ────────────────────────────────────────────────────────────

class DashavidhaCreate(BaseModel):
    session_id: str
    prakriti: Optional[Dict[str, Any]] = None
    vikriti: Optional[Dict[str, Any]] = None
    sara: Optional[str] = None
    samhanana: Optional[str] = None
    pramana: Optional[str] = None
    satmya: Optional[str] = None
    sattva: Optional[str] = None
    ahara_shakti: Optional[str] = None
    vyayama_shakti: Optional[str] = None
    vaya: Optional[str] = None


class DashavidhaOut(DashavidhaCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Document / OCR ────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_type: str
    document_type: str
    file_size_bytes: int
    ocr_status: str
    uploaded_at: datetime
    document_date: Optional[datetime]

    class Config:
        from_attributes = True


class ClinicalEntityOut(BaseModel):
    id: str
    entity_type: str
    value: str
    normalized_value: Optional[str]
    confidence: Optional[float]
    source_page: int

    class Config:
        from_attributes = True


class OCRResultOut(BaseModel):
    id: str
    document_id: str
    raw_text: Optional[str]
    overall_confidence: Optional[float]
    engine_used: str
    processing_time_ms: Optional[int]
    clinical_entities: List[ClinicalEntityOut] = []
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Timeline ──────────────────────────────────────────────────────────────

class TimelineEventOut(BaseModel):
    id: str
    event_date: Optional[datetime]
    event_year: Optional[int]
    event_type: str
    title: str
    description: Optional[str]
    source: Optional[str]
    source_document_id: Optional[str]

    class Config:
        from_attributes = True


# ─── Red Flags ─────────────────────────────────────────────────────────────

class RedFlagOut(BaseModel):
    id: str
    rule_id: str
    rule_name: str
    description: Optional[str]
    triggered_by: Optional[List[str]]
    severity: str
    is_acknowledged: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RedFlagEvaluationResponse(BaseModel):
    session_id: str
    priority: str
    red_flags: List[RedFlagOut]
    alert_required: bool


# ─── Clinical Summary ──────────────────────────────────────────────────────

class SummaryUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    history_of_present_illness: Optional[str] = None
    past_medical_history: Optional[str] = None
    surgical_history: Optional[str] = None
    medication_history: Optional[List[Dict]] = None
    allergy_information: Optional[List[str]] = None
    family_history: Optional[str] = None
    personal_history: Optional[str] = None


class SummarySourceOut(BaseModel):
    field_name: str
    source_type: str
    source_reference: Optional[str]
    confidence: Optional[float]

    class Config:
        from_attributes = True


class ClinicalSummaryOut(BaseModel):
    id: str
    session_id: str
    patient_demographics: Optional[Dict]
    chief_complaint: Optional[str]
    history_of_present_illness: Optional[str]
    socrates_summary: Optional[Dict]
    past_medical_history: Optional[str]
    surgical_history: Optional[str]
    medication_history: Optional[List]
    allergy_information: Optional[List]
    family_history: Optional[str]
    personal_history: Optional[str]
    previous_investigations: Optional[List]
    medical_timeline_summary: Optional[List]
    dashavidha_summary: Optional[Dict]
    red_flags_summary: Optional[List]
    confidence_indicators: Optional[Dict]
    items_requiring_verification: Optional[List]
    generated_at: datetime
    is_verified: bool

    class Config:
        from_attributes = True


# ─── Doctor Dashboard ──────────────────────────────────────────────────────

class PatientQueueItem(BaseModel):
    patient_id: str
    session_id: str
    patient_name: str
    age: Optional[int]
    gender: Optional[str]
    chief_complaint: Optional[str]
    priority: str
    status: str
    started_at: datetime
    red_flag_count: int
    language_code: str


class DoctorVerificationCreate(BaseModel):
    summary_id: str
    action: str  # edited | verified | added_note | deleted
    field_name: Optional[str] = None
    old_value: Optional[Any] = None
    new_value: Optional[Any] = None
    notes: Optional[str] = None


# ─── Admin ─────────────────────────────────────────────────────────────────

class UserManageCreate(BaseModel):
    mobile: str
    full_name: str
    role: str
    email: Optional[str] = None


class AuditLogOut(BaseModel):
    id: str
    user_id: Optional[str]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    result: str
    ip_address: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
