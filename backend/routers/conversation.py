"""
Conversation engine — adaptive clinical questioning.
"""

import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Session as MKSession, Response, Question, QuestionTranslation, Consent
from schemas import AnswerRequest, NextQuestionResponse, MessageResponse
from core.dependencies import get_current_user
from models import User
from config import settings

router = APIRouter(prefix="/api/conversation", tags=["conversation"])

# Load question bank from JSON file
_QUESTION_BANK_PATH = Path(settings.CLINICAL_DATA_DIR) / "question_bank" / "questions.json"
_DASHAVIDHA_PATH = Path(settings.CLINICAL_DATA_DIR) / "dashavidha" / "questions.json"

_cached_questions: Optional[list] = None
_cached_dashavidha: Optional[list] = None


def _load_questions() -> list:
    global _cached_questions
    if _cached_questions is None:
        try:
            with open(_QUESTION_BANK_PATH, "r", encoding="utf-8") as f:
                _cached_questions = json.load(f)
        except FileNotFoundError:
            _cached_questions = []
    return _cached_questions


def _load_dashavidha() -> list:
    global _cached_dashavidha
    if _cached_dashavidha is None:
        try:
            with open(_DASHAVIDHA_PATH, "r", encoding="utf-8") as f:
                _cached_dashavidha = json.load(f)
        except FileNotFoundError:
            _cached_dashavidha = []
    return _cached_dashavidha


def _get_question_text(question: dict, language: str) -> str:
    translations = question.get("translations", {})
    return translations.get(language, translations.get("en", ""))


def _get_options_for_lang(options: list, language: str) -> list:
    result = []
    for opt in options:
        label = opt.get(f"label_{language}", opt.get("label_en", opt.get("value", "")))
        result.append({"value": opt["value"], "label": label})
    return result


async def _get_answered_keys(session_id: str, db: AsyncSession) -> set:
    result = await db.execute(
        select(Response.question_key).where(Response.session_id == session_id)
    )
    return {row[0] for row in result.fetchall() if row[0]}


@router.get("/next-question", response_model=NextQuestionResponse)
async def get_next_question(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the next unanswered question for a session."""
    # Load session
    session_result = await db.execute(select(MKSession).where(MKSession.id == session_id))
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check consent
    consent_result = await db.execute(
        select(Consent).where(Consent.session_id == session_id, Consent.given == True)
    )
    if not consent_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Patient consent required before questioning")

    lang = session.language_code or "en"
    answered_keys = await _get_answered_keys(session_id, db)
    questions = _load_questions()

    for q in sorted(questions, key=lambda x: x.get("order_index", 999)):
        qid = q["question_id"]
        if qid in answered_keys:
            continue

        # Check trigger conditions (skip if parent not answered with required value)
        trigger = q.get("trigger_condition")
        if trigger:
            parent_id = trigger.get("parent")
            required_response = trigger.get("response")
            if parent_id not in answered_keys:
                continue  # parent not answered yet

            # Check what parent was answered with
            parent_result = await db.execute(
                select(Response).where(
                    Response.session_id == session_id,
                    Response.question_key == parent_id,
                )
            )
            parent_response = parent_result.scalar_one_or_none()
            if parent_response:
                val = parent_response.text_value or ""
                sv = parent_response.structured_value
                if isinstance(sv, dict):
                    val = sv.get("value", val)
                if val.lower() != required_response.lower():
                    continue  # condition not met

        options = q.get("options")
        serializable_options = None
        if isinstance(options, list):
            serializable_options = _get_options_for_lang(options, lang)
        elif isinstance(options, dict):
            serializable_options = [options]  # severity scale etc.

        return NextQuestionResponse(
            question_key=qid,
            question_text=_get_question_text(q, lang),
            control_type=q.get("control_type", "text"),
            options=serializable_options,
            category=q.get("category", "general"),
            subcategory=q.get("subcategory"),
            is_last=False,
        )

    # No more questions
    return NextQuestionResponse(
        question_key="COMPLETE",
        question_text="Thank you! We have collected all the information needed.",
        control_type="text",
        category="complete",
        is_last=True,
    )


@router.post("/answer", response_model=MessageResponse)
async def submit_answer(
    payload: AnswerRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record a patient's answer to a question."""
    session_result = await db.execute(select(MKSession).where(MKSession.id == payload.session_id))
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Update chief complaint if this is the first question
    if payload.question_key == "CHIEF_COMPLAINT_001" and payload.text_value:
        session.chief_complaint = payload.text_value

    response = Response(
        session_id=payload.session_id,
        question_key=payload.question_key,
        input_method=payload.input_method,
        raw_transcript=payload.raw_transcript,
        structured_value=payload.structured_value,
        text_value=payload.text_value,
        numeric_value=payload.numeric_value,
        asr_confidence=payload.asr_confidence,
    )
    db.add(response)
    await db.commit()
    return {"message": "Answer recorded"}


@router.post("/retry", response_model=MessageResponse)
async def retry_question(session_id: str, question_key: str, db: AsyncSession = Depends(get_db)):
    """Delete the last response for a question to allow retry."""
    result = await db.execute(
        select(Response).where(
            Response.session_id == session_id,
            Response.question_key == question_key,
        )
    )
    responses = result.scalars().all()
    for r in responses:
        await db.delete(r)
    await db.commit()
    return {"message": "Question reset for retry"}
