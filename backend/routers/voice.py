"""
Voice WebSocket router — real-time ASR streaming and TTS synthesis.
"""

import asyncio
import io
import json
import tempfile
import os
from pathlib import Path
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from core.dependencies import get_ws_user

router = APIRouter(tags=["voice"])


@router.websocket("/api/voice/stream")
async def voice_stream(websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    """
    WebSocket endpoint for real-time voice streaming.
    
    Protocol:
    - Client sends binary audio chunks (WAV/WebM)
    - Server responds with JSON: {"transcript": "...", "confidence": 0.92, "is_final": true}
    
    The server buffers audio until voice activity detection signals end of speech.
    """
    user = await get_ws_user(websocket, db)
    await websocket.accept()

    audio_buffer = bytearray()
    CHUNK_SIZE = 8192  # 8KB chunks

    try:
        while True:
            data = await websocket.receive()
            
            if "bytes" in data:
                audio_buffer.extend(data["bytes"])
                
                # Send acknowledgment
                await websocket.send_json({"status": "receiving", "buffered_bytes": len(audio_buffer)})
                
                # Simple VAD: process after receiving enough data
                if len(audio_buffer) >= CHUNK_SIZE * 4:  # ~32KB = ~1 second of audio
                    transcript, confidence = await _transcribe_audio(bytes(audio_buffer))
                    audio_buffer.clear()
                    
                    await websocket.send_json({
                        "transcript": transcript,
                        "confidence": round(confidence, 3),
                        "is_final": False,
                    })
                    
            elif "text" in data:
                msg = json.loads(data["text"])
                
                if msg.get("action") == "end_of_speech":
                    # Final transcription
                    if audio_buffer:
                        transcript, confidence = await _transcribe_audio(bytes(audio_buffer))
                        audio_buffer.clear()
                        await websocket.send_json({
                            "transcript": transcript,
                            "confidence": round(confidence, 3),
                            "is_final": True,
                        })
                        
                elif msg.get("action") == "ping":
                    await websocket.send_json({"action": "pong"})
                    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass


async def _transcribe_audio(audio_bytes: bytes) -> tuple[str, float]:
    """Transcribe audio using Whisper or return mock in development."""
    from config import settings
    
    if settings.ENV == "development" or settings.AI_PROVIDER == "mock":
        # Mock transcription for development
        await asyncio.sleep(0.5)  # Simulate processing time
        return "I have chest pain since yesterday evening.", 0.92
    
    try:
        import whisper
        import numpy as np
        
        # Save to temp file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        
        try:
            model = whisper.load_model(settings.WHISPER_MODEL)
            result = model.transcribe(tmp_path)
            transcript = result["text"].strip()
            # Whisper doesn't directly give confidence; use segment-level avg logprob
            segments = result.get("segments", [])
            if segments:
                avg_prob = sum(s.get("avg_logprob", -1) for s in segments) / len(segments)
                confidence = max(0.0, min(1.0, 1 + avg_prob))  # logprob is negative
            else:
                confidence = 0.7
            return transcript, confidence
        finally:
            os.unlink(tmp_path)
    except Exception as e:
        return f"Transcription error: {str(e)}", 0.0


@router.post("/api/voice/transcribe")
async def transcribe_audio_file(
    # File upload handled separately
):
    """Transcribe a single audio file (non-streaming fallback)."""
    return {"message": "Use WebSocket endpoint for streaming transcription"}


@router.post("/api/voice/synthesize")
async def synthesize_speech(text: str, language: str = "en"):
    """
    Text-to-speech synthesis.
    Returns audio/mpeg data.
    
    Uses gTTS (Google TTS) in development.
    In production, replace with FastSpeech2 or Azure TTS.
    """
    try:
        from gtts import gTTS
        import io
        
        lang_map = {
            "en": "en", "hi": "hi", "kn": "kn",
            "ta": "ta", "te": "te", "mr": "mr",
            "bn": "bn", "gu": "gu",
        }
        gtts_lang = lang_map.get(language, "en")
        
        tts = gTTS(text=text, lang=gtts_lang, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        
        return Response(
            content=fp.read(),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")
