"""
Red Flag Engine — rule-based clinical alert detection.
The engine is intentionally kept separate from LLM logic for transparency and safety.
"""

import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Session as MKSession, Response, RedFlag as RedFlagModel, User
from schemas import RedFlagOut, RedFlagEvaluationResponse, MessageResponse
from core.dependencies import get_current_user
from core.audit import log_action
from config import settings

router = APIRouter(prefix="/api/red-flags", tags=["red-flags"])

_RED_FLAG_RULES: Optional[dict] = None


def _load_rules() -> dict:
    global _RED_FLAG_RULES
    if _RED_FLAG_RULES is None:
        rules_path = Path(settings.CLINICAL_DATA_DIR) / "red_flags" / "rules.json"
        try:
            with open(rules_path, "r", encoding="utf-8") as f:
                _RED_FLAG_RULES = json.load(f)
        except FileNotFoundError:
            _RED_FLAG_RULES = {"rules": []}
    return _RED_FLAG_RULES


def _build_session_context(responses: list) -> dict:
    """Build a simple fact dictionary from session responses."""
    context = {
        "symptoms": [],
        "severity": 0,
        "timing": None,
        "radiation": [],
        "chief_complaint": "",
    }
    for resp in responses:
        qk = resp.question_key or ""
        sv = resp.structured_value
        tv = resp.text_value or ""

        if qk == "CHIEF_COMPLAINT_001":
            context["chief_complaint"] = tv.lower()

        elif qk == "SOCRATES_SEVERITY_001" and resp.numeric_value is not None:
            context["severity"] = int(resp.numeric_value)

        elif qk == "SOCRATES_TIMING_001" and tv:
            context["timing"] = tv.lower()

        elif qk == "ASSOCIATED_SYMPTOMS_001":
            if isinstance(sv, list):
                context["symptoms"].extend([s.lower() for s in sv])
            elif tv:
                context["symptoms"].extend([s.strip().lower() for s in tv.split(",")])

        elif qk == "SOCRATES_RADIATION_002" and tv:
            context["radiation"].extend([s.strip().lower() for s in tv.split(",")])

        # Also parse chief complaint for symptom keywords
        complaint = context["chief_complaint"]
        for kw in ["chest pain", "chest_pain", "shortness of breath", "shortness_of_breath",
                   "breathing difficulty", "palpitations", "headache", "dizziness",
                   "nausea", "vomiting", "fever", "sweating", "fainting", "faint"]:
            if kw.replace("_", " ") in complaint and kw.replace(" ", "_") not in context["symptoms"]:
                context["symptoms"].append(kw.replace(" ", "_"))

    return context


def _evaluate_check(check: dict, context: dict) -> bool:
    """Evaluate a single check condition against context."""
    if "operator" in check:
        op = check["operator"]
        sub_checks = check.get("checks", [])
        if op == "AND":
            return all(_evaluate_check(c, context) for c in sub_checks)
        elif op == "OR":
            return any(_evaluate_check(c, context) for c in sub_checks)
        return False

    field = check.get("field")
    value = context.get(field)

    if check.get("contains") and isinstance(value, list):
        return check["contains"].lower() in value
    if check.get("any_of") and isinstance(value, list):
        return any(v.lower() in value for v in check["any_of"])
    if check.get("equals"):
        return str(value).lower() == str(check["equals"]).lower()
    if check.get("contains_text") and isinstance(value, str):
        return check["contains_text"].lower() in value.lower()
    if check.get("greater_than") is not None and isinstance(value, (int, float)):
        return value > check["greater_than"]

    return False


def _evaluate_rules(context: dict) -> list[dict]:
    """Evaluate all rules against the session context."""
    rules_data = _load_rules()
    triggered = []
    for rule in rules_data.get("rules", []):
        conditions = rule.get("conditions", {})
        if _evaluate_check(conditions, context):
            triggered.append(rule)
    return triggered


@router.post("/evaluate/{session_id}", response_model=RedFlagEvaluationResponse)
async def evaluate_red_flags(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Evaluate red flag rules for a session and update priority."""
    session_result = await db.execute(select(MKSession).where(MKSession.id == session_id))
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Load responses
    responses_result = await db.execute(
        select(Response).where(Response.session_id == session_id)
    )
    responses = responses_result.scalars().all()

    context = _build_session_context(responses)
    triggered_rules = _evaluate_rules(context)

    # Delete old red flags for this session (re-evaluate)
    existing = await db.execute(select(RedFlagModel).where(RedFlagModel.session_id == session_id))
    for rf in existing.scalars().all():
        await db.delete(rf)

    # Insert new red flags
    red_flag_records = []
    highest_severity = "normal"

    for rule in triggered_rules:
        rf = RedFlagModel(
            session_id=session_id,
            rule_id=rule["rule_id"],
            rule_name=rule["rule_name"],
            description=rule.get("description"),
            triggered_by=list(context["symptoms"]),
            severity=rule["severity"],
        )
        db.add(rf)
        red_flag_records.append(rf)

        # Determine highest priority
        if rule["severity"] == "high":
            highest_severity = "high"
        elif rule["severity"] == "medium" and highest_severity == "normal":
            highest_severity = "medium"

    # Map to session priority
    priority_map = {"high": "high", "medium": "medium", "normal": "normal"}
    session.priority = priority_map.get(highest_severity, "normal")
    await db.commit()

    # Refresh for IDs
    result_list = []
    for rf in red_flag_records:
        await db.refresh(rf)
        result_list.append(RedFlagOut.model_validate(rf))

    await log_action(
        db, "red_flags_evaluated", user_id=current_user.id,
        resource_type="session", resource_id=session_id,
        details={"triggered": len(triggered_rules), "priority": session.priority},
    )

    return RedFlagEvaluationResponse(
        session_id=session_id,
        priority=session.priority,
        red_flags=result_list,
        alert_required=highest_severity == "high",
    )


@router.get("/{session_id}", response_model=list[RedFlagOut])
async def get_red_flags(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(RedFlagModel).where(RedFlagModel.session_id == session_id)
    )
    return [RedFlagOut.model_validate(rf) for rf in result.scalars().all()]
