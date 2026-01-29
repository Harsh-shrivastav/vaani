"""
Vaani Backend - Vercel Serverless API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

# Initialize FastAPI
app = FastAPI(title="Vaani API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SimplifyRequest(BaseModel):
    text: str
    language: str = "English"

class SimplifyResponse(BaseModel):
    raw_text: str
    simple_text: str
    saved: bool = False

# Health check
@app.get("/")
@app.get("/api")
@app.get("/api/")
def health():
    return {"status": "healthy", "version": "2.0.0"}

# Simplify endpoint
@app.post("/simplify-text")
@app.post("/api/simplify-text")
async def simplify_endpoint(request: SimplifyRequest):
    api_key = os.environ.get("GOOGLE_API_KEY")
    
    if not api_key:
        return SimplifyResponse(
            raw_text=request.text,
            simple_text=f"[API KEY NOT SET] {request.text}",
            saved=False
        )
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""Simplify this text for deaf users. Use simple words, active voice, remove filler words.
Text: "{request.text}"
Language: {request.language}
Output only the simplified text:"""
        
        response = model.generate_content(prompt)
        simplified = response.text.strip()
        
        return SimplifyResponse(
            raw_text=request.text,
            simple_text=simplified,
            saved=False
        )
    except Exception as e:
        return SimplifyResponse(
            raw_text=request.text,
            simple_text=f"[ERROR: {str(e)}] {request.text}",
            saved=False
        )

# Vercel handler
handler = app
