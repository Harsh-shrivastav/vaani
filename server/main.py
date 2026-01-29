"""
Vaani Backend Server (Google Cloud Ready)
FastAPI application prepared for Google Cloud Run deployment.
Uses Google Gemini for AI, Cloud Speech-to-Text, Firebase Storage, and Firestore.
"""

import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, Optional
from pydantic import BaseModel, StringConstraints
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os
import base64

# Load environment variables
load_dotenv()

# Import Google Cloud modules
import sys
sys.path.append('..')

from modules.simplifier.simplifier_gemini import simplify_text

# Firestore is optional - disable for local development
try:
    from modules.database.firestore_db import save_transcript
    FIRESTORE_ENABLED = True
except Exception as e:
    print(f"⚠️ Firestore disabled: {e}")
    FIRESTORE_ENABLED = False
    def save_transcript(*args, **kwargs): return ""

# Optional: Import speech module (requires Google Cloud credentials)
try:
    from modules.speech.speech_google import transcribe_audio
    SPEECH_ENABLED = True
except Exception as e:
    print(f"⚠️ Speech-to-Text disabled: {e}")
    SPEECH_ENABLED = False

# Configuration
CORS_ALLOW_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
PORT = int(os.getenv("PORT", 8000))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Application lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 50)
    print("🚀 Vaani Backend Starting...")
    print(f"📍 Environment: {ENVIRONMENT}")
    print("✅ Google Gemini AI loaded")
    print(f"🎤 Speech-to-Text: {'Enabled' if SPEECH_ENABLED else 'Disabled'}")
    print("=" * 50)
    yield
    print("🛑 Vaani Backend Shutting Down...")

# Initialize FastAPI
app = FastAPI(
    title="Vaani API",
    description="Real-Time AI Captioning & Sign Language Assistant",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware - Allow all origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Request/Response Models
# ============================================

class SimplifyRequest(BaseModel):
    """Request model for text simplification."""
    text: Annotated[str, StringConstraints(min_length=1)]
    language: str = "English"


class SimplifyResponse(BaseModel):
    """Response model for simplified text."""
    raw_text: str
    simple_text: str
    saved: bool = False


class TranscribeRequest(BaseModel):
    """Request model for audio transcription."""
    audio_data: str  # Base64 encoded audio
    language: str = "English"


class TranscribeResponse(BaseModel):
    """Response model for transcription."""
    transcript: str
    language: str


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    version: str
    environment: str
    services: dict


# ============================================
# API Endpoints
# ============================================

@app.get("/", response_model=HealthResponse)
def health_check():
    """Health check endpoint for Cloud Run."""
    return HealthResponse(
        status="healthy",
        version="2.0.0",
        environment=ENVIRONMENT,
        services={
            "gemini": True,
            "speech_to_text": SPEECH_ENABLED,
            "firestore": True,
            "firebase_storage": True
        }
    )


@app.post("/simplify-text", response_model=SimplifyResponse)
async def simplify_text_endpoint(request: SimplifyRequest):
    """
    Simplify text using Google Gemini AI.
    Optionally saves to Firestore.
    """
    
    try:
        # Process text through Gemini
        simplified = simplify_text(
            raw_text=request.text,
            target_language=request.language
        )
        
        # Save to Firestore (non-blocking, optional)
        saved = False
        try:
            doc_id = save_transcript(
                raw_text=request.text,
                simplified_text=simplified,
                language=request.language
            )
            saved = bool(doc_id)
        except Exception:
            pass  # Non-blocking, continue even if save fails
        
        return SimplifyResponse(
            raw_text=request.text,
            simple_text=simplified,
            saved=saved
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing text: {str(e)}"
        )


@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio_endpoint(request: TranscribeRequest):
    """
    Transcribe audio using Google Cloud Speech-to-Text.
    Accepts base64-encoded audio data.
    """
    
    if not SPEECH_ENABLED:
        raise HTTPException(
            status_code=503,
            detail="Speech-to-Text service is not available"
        )
    
    try:
        # Decode base64 audio
        audio_bytes = base64.b64decode(request.audio_data)
        
        # Transcribe using Google Speech-to-Text
        transcript = transcribe_audio(
            audio_data=audio_bytes,
            language=request.language
        )
        
        return TranscribeResponse(
            transcript=transcript,
            language=request.language
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error transcribing audio: {str(e)}"
        )


@app.post("/transcribe-file")
async def transcribe_file_endpoint(
    file: UploadFile = File(...),
    language: str = "English"
):
    """
    Transcribe an uploaded audio file.
    Accepts WAV, WEBM, or OGG files.
    """
    
    if not SPEECH_ENABLED:
        raise HTTPException(
            status_code=503,
            detail="Speech-to-Text service is not available"
        )
    
    try:
        # Read file content
        audio_bytes = await file.read()
        
        # Transcribe using Google Speech-to-Text
        transcript = transcribe_audio(
            audio_data=audio_bytes,
            language=language
        )
        
        return {
            "transcript": transcript,
            "language": language,
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error transcribing file: {str(e)}"
        )


# ============================================
# Run Application
# ============================================

if __name__ == "__main__":
    print(f"--- Starting Vaani Backend on http://0.0.0.0:{PORT} ---")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=(ENVIRONMENT == "development")
    )