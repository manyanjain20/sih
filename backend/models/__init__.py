"""
MediKiosk ORM Models — All database tables.
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, JSON, String, Text, func
)
from sqlalchemy.orm import relationship

from database import Base

# Universal UUID type support across PostgreSQL and SQLite
def UUID(*args, **kwargs):
    return String(36)

def gen_uuid():
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# User / Auth
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    mobile = Column(String(15), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    full_name = Column(String(255), nullable=True)
    role = Column(
        Enum("patient", "doctor", "nurse", "admin", name="user_role"),
        nullable=False,
        default="patient",
    )
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    hashed_password = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("Patient", back_populates="user", uselist=False)
    doctor = relationship("Doctor", back_populates="user", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="user")


class OTPRecord(Base):
    __tablename__ = "otp_records"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    mobile = Column(String(15), nullable=False, index=True)
    otp_code = Column(String(10), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------------------------------------------------------------------------
# Patient
# ---------------------------------------------------------------------------

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True)
    abha_id = Column(String(20), unique=True, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(Enum("male", "female", "other", "prefer_not_to_say", name="gender_type"), nullable=True)
    blood_group = Column(String(5), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(15), nullable=True)
    known_allergies = Column(JSON, default=list)
    chronic_conditions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="patient")
    sessions = relationship("Session", back_populates="patient")
    documents = relationship("Document", back_populates="patient")
    medical_timeline = relationship("MedicalTimeline", back_populates="patient")


# ---------------------------------------------------------------------------
# Doctor
# ---------------------------------------------------------------------------

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True)
    registration_number = Column(String(50), unique=True, nullable=True)
    specialization = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    qualification = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="doctor")
    verifications = relationship("DoctorVerification", back_populates="doctor")


# ---------------------------------------------------------------------------
# Session
# ---------------------------------------------------------------------------

class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id"), nullable=False)
    language_code = Column(String(10), default="en")
    status = Column(
        Enum("active", "completed", "abandoned", "verified", name="session_status"),
        default="active",
    )
    priority = Column(
        Enum("normal", "medium", "high", name="priority_level"),
        default="normal",
    )
    chief_complaint = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"), nullable=True)

    patient = relationship("Patient", back_populates="sessions")
    consent = relationship("Consent", back_populates="session", uselist=False)
    responses = relationship("Response", back_populates="session")
    socrates = relationship("SocratesAssessment", back_populates="session", uselist=False)
    dashavidha = relationship("DashavidhaAssessment", back_populates="session", uselist=False)
    red_flags = relationship("RedFlag", back_populates="session")
    clinical_summary = relationship("ClinicalSummary", back_populates="session", uselist=False)


# ---------------------------------------------------------------------------
# Consent
# ---------------------------------------------------------------------------

class Consent(Base):
    __tablename__ = "consents"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    session_id = Column(UUID(as_uuid=False), ForeignKey("sessions.id"), unique=True)
    given = Column(Boolean, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(50), nullable=True)
    consent_text_version = Column(String(20), default="1.0")

    session = relationship("Session", back_populates="consent")


# ---------------------------------------------------------------------------
# Questions / Translations
# ---------------------------------------------------------------------------

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    question_id = Column(String(50), unique=True, nullable=False, index=True)
    category = Column(
        Enum(
            "chief_complaint", "socrates", "dashavidha", "general_history",
            "medication", "allergy", "family_history", "personal_history",
            name="question_category",
        ),
        nullable=False,
    )
    subcategory = Column(String(50), nullable=True)
    input_type = Column(
        Enum("voice", "touch", "both", name="input_type"),
        default="both",
    )
    control_type = Column(
        Enum(
            "yes_no", "multiple_choice", "single_choice", "severity_scale",
            "date", "number", "body_location", "duration", "text",
            name="control_type",
        ),
        default="text",
    )
    options = Column(JSON, nullable=True)  # For MCQ options
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    parent_question_id = Column(String(50), nullable=True)  # For follow-up questions
    trigger_condition = Column(JSON, nullable=True)  # e.g. {"response": "yes", "parent": "PAIN_001"}

    translations = relationship("QuestionTranslation", back_populates="question")
    responses = relationship("Response", back_populates="question")


class QuestionTranslation(Base):
    __tablename__ = "question_translations"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    question_id_fk = Column(UUID(as_uuid=False), ForeignKey("questions.id"), nullable=False)
    language_code = Column(String(10), nullable=False)
    text = Column(Text, nullable=False)
    audio_url = Column(String(500), nullable=True)

    question = relationship("Question", back_populates="translations")


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------

class Response(Base):
    __tablename__ = "responses"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    session_id = Column(UUID(as_uuid=False), ForeignKey("sessions.id"), nullable=False)
    question_id_fk = Column(UUID(as_uuid=False), ForeignKey("questions.id"), nullable=True)
    question_key = Column(String(100), nullable=True)  # question_id string for non-DB questions
    input_method = Column(Enum("voice", "touch", "text", name="input_method_type"), default="text")
    raw_transcript = Column(Text, nullable=True)
    structured_value = Column(JSON, nullable=True)
    text_value = Column(Text, nullable=True)
    numeric_value = Column(Float, nullable=True)
    asr_confidence = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("Session", back_populates="responses")
    question = relationship("Question", back_populates="responses")


# ---------------------------------------------------------------------------
# SOCRATES Assessment
# ---------------------------------------------------------------------------

class SocratesAssessment(Base):
    __tablename__ = "socrates_assessments"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    session_id = Column(UUID(as_uuid=False), ForeignKey("sessions.id"), unique=True)
    site = Column(Text, nullable=True)
    onset = Column(Text, nullable=True)
    character = Column(Text, nullable=True)
    radiation = Column(Text, nullable=True)
    associated_symptoms = Column(JSON, default=list)
    timing = Column(Text, nullable=True)
    exacerbating_factors = Column(JSON, default=list)
    relieving_factors = Column(JSON, default=list)
    severity = Column(Integer, nullable=True)  # 0-10
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    session = relationship("Session", back_populates="socrates")


# ---------------------------------------------------------------------------
# Dashavidha Assessment (AYUSH)
# ---------------------------------------------------------------------------

class DashavidhaAssessment(Base):
    __tablename__ = "dashavidha_assessments"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    session_id = Column(UUID(as_uuid=False), ForeignKey("sessions.id"), unique=True)
    prakriti = Column(JSON, nullable=True)
    vikriti = Column(JSON, nullable=True)
    sara = Column(String(100), nullable=True)
    samhanana = Column(String(100), nullable=True)
    pramana = Column(String(100), nullable=True)
    satmya = Column(Text, nullable=True)
    sattva = Column(String(100), nullable=True)
    ahara_shakti = Column(String(100), nullable=True)
    vyayama_shakti = Column(String(100), nullable=True)
    vaya = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    session = relationship("Session", back_populates="dashavidha")


# ---------------------------------------------------------------------------
# Documents / OCR
# ---------------------------------------------------------------------------

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id"), nullable=False)
    session_id = Column(UUID(as_uuid=False), ForeignKey("sessions.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, jpeg, png
    file_size_bytes = Column(Integer, nullable=False)
    document_type = Column(
        Enum(
            "prescription", "lab_report", "discharge_summary",
            "investigation", "other", name="document_type",
        ),
        default="other",
    )
    document_date = Column(DateTime, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    ocr_status = Column(
        Enum("pending", "processing", "completed", "failed", name="ocr_status"),
        default="pending",
    )

    patient = relationship("Patient", back_populates="documents")
    ocr_result = relationship("OCRResult", back_populates="document", uselist=False)


class OCRResult(Base):
    __tablename__ = "ocr_results"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id"), unique=True)
    raw_text = Column(Text, nullable=True)
    preprocessed = Column(Boolean, default=False)
    engine_used = Column(String(50), default="tesseract")
    overall_confidence = Column(Float, nullable=True)
    page_count = Column(Integer, default=1)
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="ocr_result")
    clinical_entities = relationship("ClinicalEntity", back_populates="ocr_result")


class ClinicalEntity(Base):
    __tablename__ = "clinical_entities"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    ocr_result_id = Column(UUID(as_uuid=False), ForeignKey("ocr_results.id"), nullable=False)
    entity_type = Column(
        Enum(
            "diagnosis", "medication", "dosage", "frequency", "duration",
            "investigation", "investigation_value", "unit", "date", "procedure",
            "allergy", "hospital", "doctor_name", name="entity_type",
        ),
        nullable=False,
    )
    value = Column(Text, nullable=False)
    normalized_value = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    source_page = Column(Integer, default=1)
    source_text_span = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ocr_result = relationship("OCRResult", back_populates="clinical_entities")


# ---------------------------------------------------------------------------
# Medication / Investigation (structured)
# ---------------------------------------------------------------------------

class Medication(Base):
    __tablename__ = "medications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id"), nullable=False)
    session_id = Column(UUID(as_uuid=False), ForeignKey("sessions.id"), nullable=True)
    source = Column(
        Enum("patient_reported", "ocr_extracted", "doctor_entered", name="medication_source"),
        default="patient_reported",
    )
    medicine_name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)
    duration = Column(String(100), nullable=True)
    indication = Column(String(255), nullable=True)
    prescribed_date = Column(DateTime, nullable=True)
    confidence = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=False)


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id"), nullable=False)
    session_id = Column(UUID(as_uuid=False), ForeignKey("sessions.id"), nullable=True)
    source = Column(String(50), default="ocr_extracted")
    test_name = Column(String(255), nullable=False)
    value = Column(String(100), nullable=True)
    unit = Column(String(50), nullable=True)
    reference_range = Column(String(100), nullable=True)
    test_date = Column(DateTime, nullable=True)
    confidence = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=False)


# ---------------------------------------------------------------------------
# Medical Timeline
# ---------------------------------------------------------------------------

class MedicalTimeline(Base):
    __tablename__ = "medical_timeline"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("patients.id"), nullable=False)
    session_id = Column(UUID(as_uuid=False), ForeignKey("sessions.id"), nullable=True)
    event_date = Column(DateTime, nullable=True)
    event_year = Column(Integer, nullable=True)
    event_type = Column(
        Enum(
            "diagnosis", "prescription", "investigation", "procedure",
            "hospitalization", "complaint", name="timeline_event_type",
        ),
        nullable=False,
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source = Column(String(50), nullable=True)  # document_id or "patient_reported"
    source_document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="medical_timeline")


# ---------------------------------------------------------------------------
# Red Flags
# ---------------------------------------------------------------------------

class RedFlag(Base):
    __tablename__ = "red_flags"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    session_id = Column(UUID(as_uuid=False), ForeignKey("sessions.id"), nullable=False)
    rule_id = Column(String(100), nullable=False)
    rule_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    triggered_by = Column(JSON, nullable=True)  # list of matched conditions
    severity = Column(
        Enum("high", "medium", "low", name="red_flag_severity"),
        nullable=False,
    )
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(UUID(as_uuid=False), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("Session", back_populates="red_flags")


# ---------------------------------------------------------------------------
# Clinical Summary
# ---------------------------------------------------------------------------

class ClinicalSummary(Base):
    __tablename__ = "clinical_summaries"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    session_id = Column(UUID(as_uuid=False), ForeignKey("sessions.id"), unique=True)
    patient_demographics = Column(JSON, nullable=True)
    chief_complaint = Column(Text, nullable=True)
    history_of_present_illness = Column(Text, nullable=True)
    socrates_summary = Column(JSON, nullable=True)
    past_medical_history = Column(Text, nullable=True)
    surgical_history = Column(Text, nullable=True)
    medication_history = Column(JSON, nullable=True)
    allergy_information = Column(JSON, nullable=True)
    family_history = Column(Text, nullable=True)
    personal_history = Column(Text, nullable=True)
    previous_investigations = Column(JSON, nullable=True)
    medical_timeline_summary = Column(JSON, nullable=True)
    dashavidha_summary = Column(JSON, nullable=True)
    red_flags_summary = Column(JSON, nullable=True)
    confidence_indicators = Column(JSON, nullable=True)
    items_requiring_verification = Column(JSON, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    last_modified_at = Column(DateTime(timezone=True), onupdate=func.now())
    generation_method = Column(String(50), default="rule_based")  # rule_based, llm_assisted
    is_verified = Column(Boolean, default=False)

    session = relationship("Session", back_populates="clinical_summary")
    sources = relationship("SummarySource", back_populates="summary")
    verifications = relationship("DoctorVerification", back_populates="summary")


class SummarySource(Base):
    __tablename__ = "summary_sources"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    summary_id = Column(UUID(as_uuid=False), ForeignKey("clinical_summaries.id"), nullable=False)
    field_name = Column(String(100), nullable=False)
    source_type = Column(
        Enum("patient_provided", "ocr_extracted", "doctor_entered", "ai_generated", name="source_type"),
        nullable=False,
    )
    source_reference = Column(String(255), nullable=True)
    confidence = Column(Float, nullable=True)

    summary = relationship("ClinicalSummary", back_populates="sources")


class DoctorVerification(Base):
    __tablename__ = "doctor_verifications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    summary_id = Column(UUID(as_uuid=False), ForeignKey("clinical_summaries.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"), nullable=False)
    action = Column(
        Enum("edited", "verified", "added_note", "deleted", name="verification_action"),
        nullable=False,
    )
    field_name = Column(String(100), nullable=True)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    summary = relationship("ClinicalSummary", back_populates="verifications")
    doctor = relationship("Doctor", back_populates="verifications")


# ---------------------------------------------------------------------------
# Audit Log
# ---------------------------------------------------------------------------

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    result = Column(String(50), default="success")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")


# Expose all models for import
all_models = [
    User, OTPRecord, Patient, Doctor, Session, Consent,
    Question, QuestionTranslation, Response,
    SocratesAssessment, DashavidhaAssessment,
    Document, OCRResult, ClinicalEntity, Medication, Investigation,
    MedicalTimeline, RedFlag,
    ClinicalSummary, SummarySource, DoctorVerification,
    AuditLog,
]
