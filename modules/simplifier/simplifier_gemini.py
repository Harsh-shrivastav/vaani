"""
Vaani - Text Simplification Module (Google Gemini)
Uses Google Gemini 2.5 Pro API for AI-powered text simplification.
"""

from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("❌ GOOGLE_API_KEY not found in .env file.")

# Initialize client
client = genai.Client(api_key=GOOGLE_API_KEY)

# Use Gemini 2.5 Pro for advanced reasoning
MODEL_NAME = "gemini-3-flash"

# AI System Instruction for Text Simplification
SIMPLIFICATION_PROMPT = """
You are an AI assistant for Deaf and Hard-of-Hearing (DHH) users.
Your single job is to simplify a raw speech transcription.

**CORE TASK (MUST FOLLOW):**
1.  Your task is to simplify the text. Simplify the [Raw Text] into the [Target Language].

**CRITICAL SAFETY RULES (DO NOT VIOLATE):**
* **DO NOT HALLUCINATE.** Do NOT add any people ("mom"), places, objects, or *actions* ("I will slap you") that are not in the [Raw Text].
* **DO NOT GUESS.** If the [Raw Text] is unclear, just translate and simplify it as-is.
* **DO NOT ADD OPINIONS.** Your job is to translate, not editorialize.

**STYLE RULES:**
1.  **Simplicity:** Use short, simple sentences. Use 5th-grade level vocabulary.
2.  **Active Voice:** ALWAYS use the **Active Voice**. (e.g., "I bought chocolate.")
3.  **Remove Fillers:** Delete *all* filler words (like "um", "ah", "uh", "you know", "na", "toh", "matlab") and stutters.

**EMOTIONAL CONTEXT RULE:**
* You are **ONLY** allowed to add context in brackets `()` if the *tone* of the [Raw Text] implies an emotion.
* The context must **ONLY DESCRIBE THE TONE**, not add new actions.
* **GOOD Example:** "hum match jeet gaye" -> "We won the match (joyfully)."
* **BAD Example (DO NOT DO THIS):** "itna zor ka tamacha marunga" -> "I will slap you (aggressively)."
* **GOOD Example:** "itna zor ka tamacha marunga" -> "I will slap you very hard (spoken aggressively)."
* **GOOD Example:** "then dont ever come back" -> "then never come back (spoken angrily)."

**FINAL OUTPUT RULE:**
* Respond ONLY with the final, simplified caption. Do NOT add any extra phrases like "Here is the simplified text:".
"""


def simplify_text(raw_text: str, target_language: str = "English") -> str:
    """
    Simplifies and translates text using Google Gemini AI.
    
    Args:
        raw_text: Original transcribed text
        target_language: Target language for translation
    
    Returns:
        Simplified and translated text
    """
    
    prompt = f"""{SIMPLIFICATION_PROMPT}

[Raw Text]: "{raw_text}"
[Target Language]: "{target_language}"
"""
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=1024,
            )
        )
        
        return response.text.strip()
    
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return raw_text


# Testing module
if __name__ == "__main__":
    print(f"\n--- Testing Simplification Engine (Google Gemini / {MODEL_NAME}) ---")
    
    # Test 1: Complex English
    test_1 = "Uh, notwithstanding the, you know, the significant meteorological challenges, the team endeavored to persevere."
    result = simplify_text(test_1, "English")
    print(f"Input: {test_1}")
    print(f"Output: {result}\n")

    # Test 2: English to Hindi
    test_2 = "I would like to inform you that the meeting has been postponed until 3 PM tomorrow."
    result = simplify_text(test_2, "Hindi")
    print(f"Input: {test_2}")
    print(f"Output: {result}")
