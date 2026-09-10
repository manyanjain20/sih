"""
Seed demo data for development/demo purposes.
Creates demo users (patient, doctor, nurse, admin) and a sample session.
"""

import json
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import AsyncSessionLocal
from models import (
    User, Patient, Doctor, Session as MKSession, Consent,
    Response, SocratesAssessment, DashavidhaAssessment,
    MedicalTimeline, Question, QuestionTranslation, RedFlag
)
from config import settings


async def seed_demo_data():
    """Idempotent seed — runs on startup, skips if data already exists."""
    async with AsyncSessionLocal() as db:
        await _seed_demo_users(db)
        await _seed_questions(db)


async def _seed_demo_users(db: AsyncSession):
    """Create demo accounts for all roles."""
    demo_accounts = [
        {"mobile": "9999900001", "full_name": "Ramesh Kumar", "role": "patient", "is_demo": True},
        {"mobile": "9999900002", "full_name": "Dr. Anjali Singh", "role": "doctor", "is_demo": True},
        {"mobile": "9999900003", "full_name": "Nurse Priya", "role": "nurse", "is_demo": True},
        {"mobile": "9999900004", "full_name": "Admin User", "role": "admin", "is_demo": True},
        # Additional demo patients
        {"mobile": "9999900005", "full_name": "Sunita Devi", "role": "patient", "is_demo": True},
        {"mobile": "9999900006", "full_name": "Mohammed Farooq", "role": "patient", "is_demo": True},
    ]

    for account in demo_accounts:
        existing = await db.execute(select(User).where(User.mobile == account["mobile"]))
        if existing.scalar_one_or_none():
            continue

        user = User(**account)
        db.add(user)
        await db.flush()

        if account["role"] == "patient":
            age_map = {
                "9999900001": 45, "9999900005": 62, "9999900006": 33
            }
            gender_map = {
                "9999900001": "male", "9999900005": "female", "9999900006": "male"
            }
            patient = Patient(
                user_id=user.id,
                age=age_map.get(account["mobile"], 40),
                gender=gender_map.get(account["mobile"], "male"),
                blood_group="O+",
                known_allergies=["Penicillin"] if account["mobile"] == "9999900001" else [],
                chronic_conditions=["Hypertension", "Diabetes Type 2"] if account["mobile"] == "9999900001" else [],
            )
            db.add(patient)

            # For first demo patient, create a sample session with data
            if account["mobile"] == "9999900001":
                await db.flush()
                await _seed_demo_session(db, patient, user)

        elif account["role"] == "doctor":
            doctor = Doctor(
                user_id=user.id,
                registration_number="MH-2024-001234",
                specialization="General Medicine",
                department="OPD",
                qualification="MBBS, MD (General Medicine)",
            )
            db.add(doctor)

    await db.commit()


async def _seed_demo_session(db: AsyncSession, patient: Patient, user: User):
    """Create a realistic demo session for the demo patient."""
    # Create session
    session = MKSession(
        patient_id=patient.id,
        language_code="en",
        status="completed",
        priority="high",
        chief_complaint="Chest pain and difficulty breathing",
    )
    db.add(session)
    await db.flush()

    # Create consent
    consent = Consent(session_id=session.id, given=True, consent_text_version="1.0")
    db.add(consent)

    # Create sample responses
    responses_data = [
        ("CHIEF_COMPLAINT_001", "voice", "Chest pain and difficulty breathing", None, None, 0.94),
        ("SOCRATES_SITE_001", "touch", "Left side of chest", None, None, None),
        ("SOCRATES_ONSET_001", "touch", "yesterday", {"value": "yesterday"}, None, None),
        ("SOCRATES_CHARACTER_001", "touch", "sharp, crushing", {"values": ["sharp", "crushing"]}, None, None),
        ("SOCRATES_RADIATION_001", "touch", "yes", {"value": "yes"}, None, None),
        ("SOCRATES_RADIATION_002", "touch", "left arm and jaw", None, None, None),
        ("SOCRATES_SEVERITY_001", "touch", "8", None, 8.0, None),
        ("SOCRATES_TIMING_001", "touch", "intermittent", {"value": "intermittent"}, None, None),
        ("SOCRATES_AGGRAVATING_001", "touch", "exertion", {"values": ["exertion", "movement"]}, None, None),
        ("SOCRATES_RELIEVING_001", "touch", "rest", {"values": ["rest"]}, None, None),
        ("ASSOCIATED_SYMPTOMS_001", "touch", "shortness_of_breath, sweating, palpitations",
         {"values": ["shortness_of_breath", "sweating", "palpitations"]}, None, None),
        ("HISTORY_PAST_MEDICAL_001", "touch", "diabetes, hypertension",
         {"values": ["diabetes", "hypertension"]}, None, None),
        ("HISTORY_SURGERY_001", "touch", "no", {"value": "no"}, None, None),
        ("MEDICATION_CURRENT_001", "touch", "yes", {"value": "yes"}, None, None),
        ("ALLERGY_001", "touch", "yes", {"value": "yes"}, None, None),
        ("FAMILY_HISTORY_001", "touch", "heart_disease, diabetes",
         {"values": ["heart_disease", "diabetes"]}, None, None),
        ("PERSONAL_HISTORY_SMOKING_001", "touch", "ex_smoker", {"value": "ex_smoker"}, None, None),
        ("PERSONAL_HISTORY_ALCOHOL_001", "touch", "occasional", {"value": "occasional"}, None, None),
    ]

    for qk, method, text, structured, numeric, confidence in responses_data:
        resp = Response(
            session_id=session.id,
            question_key=qk,
            input_method=method,
            text_value=text,
            structured_value=structured,
            numeric_value=numeric,
            asr_confidence=confidence,
        )
        db.add(resp)

    # SOCRATES Assessment
    socrates = SocratesAssessment(
        session_id=session.id,
        site="Left side of chest",
        onset="Yesterday evening",
        character="Sharp, crushing pressure",
        radiation="Left arm and jaw",
        associated_symptoms=["Shortness of breath", "Sweating", "Palpitations"],
        timing="Intermittent, worsens with exertion",
        exacerbating_factors=["Physical exertion", "Climbing stairs"],
        relieving_factors=["Rest", "Sitting upright"],
        severity=8,
    )
    db.add(socrates)

    # Dashavidha Assessment
    dashavidha = DashavidhaAssessment(
        session_id=session.id,
        prakriti={"dominant": "pitta", "secondary": "vata"},
        vikriti={"current": "pitta_aggravated"},
        sara="average",
        samhanana="madhyama",
        pramana="madhyama",
        satmya="Spicy food, moderate exercise",
        sattva="rajasic",
        ahara_shakti="moderate",
        vyayama_shakti="low",
        vaya="madhyama",
    )
    db.add(dashavidha)

    # Medical Timeline
    timeline_events = [
        (patient.id, session.id, 2020, "diagnosis", "Hypertension Diagnosed",
         "Patient diagnosed with essential hypertension. Started on Amlodipine."),
        (patient.id, session.id, 2021, "prescription", "Diabetes Management Initiated",
         "Type 2 DM diagnosed. Metformin 500mg BD started."),
        (patient.id, session.id, 2023, "investigation", "Annual Blood Work",
         "HbA1c: 7.2%, FBS: 142 mg/dL, Creatinine: 0.9 mg/dL"),
        (patient.id, session.id, 2026, "complaint", "Current Presentation",
         "Chest pain with dyspnea — current visit"),
    ]
    for patient_id, sess_id, year, event_type, title, desc in timeline_events:
        timeline = MedicalTimeline(
            patient_id=patient_id,
            session_id=sess_id,
            event_year=year,
            event_type=event_type,
            title=title,
            description=desc,
            source="patient_reported",
        )
        db.add(timeline)

    # Red Flags
    red_flag1 = RedFlag(
        session_id=session.id,
        rule_id="RF_CARDIAC_001",
        rule_name="Possible Acute Coronary Syndrome",
        description="Chest pain with shortness of breath or sweating suggests possible cardiac emergency.",
        triggered_by=["chest_pain", "shortness_of_breath", "sweating", "palpitations"],
        severity="high",
    )
    db.add(red_flag1)

    red_flag2 = RedFlag(
        session_id=session.id,
        rule_id="RF_CARDIAC_002",
        rule_name="Chest Pain with Radiation",
        description="Chest pain radiating to arm and jaw — classic ACS indicator.",
        triggered_by=["chest_pain", "left_arm", "jaw"],
        severity="high",
    )
    db.add(red_flag2)


async def _seed_questions(db: AsyncSession):
    """Seed question bank from JSON file into database."""
    questions_path = Path(settings.CLINICAL_DATA_DIR) / "question_bank" / "questions.json"
    if not questions_path.exists():
        return

    with open(questions_path, "r", encoding="utf-8") as f:
        questions_data = json.load(f)

    for q_data in questions_data:
        # Check if question already exists
        existing = await db.execute(
            select(Question).where(Question.question_id == q_data["question_id"])
        )
        if existing.scalar_one_or_none():
            continue

        question = Question(
            question_id=q_data["question_id"],
            category=q_data["category"],
            subcategory=q_data.get("subcategory"),
            control_type=q_data.get("control_type", "text"),
            input_type=q_data.get("input_type", "both"),
            options=q_data.get("options"),
            order_index=q_data.get("order_index", 0),
            parent_question_id=q_data.get("parent_question_id"),
            trigger_condition=q_data.get("trigger_condition"),
        )
        db.add(question)
        await db.flush()

        # Add translations
        for lang_code, text in q_data.get("translations", {}).items():
            translation = QuestionTranslation(
                question_id_fk=question.id,
                language_code=lang_code,
                text=text,
            )
            db.add(translation)

    await db.commit()
