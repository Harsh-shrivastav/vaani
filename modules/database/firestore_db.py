"""
Vaani - Database Module (Cloud Firestore)
Handles transcript storage and history in Cloud Firestore.
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Firestore collection name
COLLECTION_NAME = "transcripts"

# Initialize Firebase Admin SDK (only once)
_db = None


def get_firestore_client():
    """Get or initialize Firestore client."""
    global _db
    
    if _db is not None:
        return _db
    
    try:
        # Check if Firebase is already initialized
        try:
            app = firebase_admin.get_app()
        except ValueError:
            # Initialize Firebase
            cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            else:
                # Use default credentials (for Cloud Run)
                firebase_admin.initialize_app()
        
        _db = firestore.client()
        print("✅ Firestore initialized")
        return _db
    
    except Exception as e:
        print(f"⚠️ Firestore initialization failed: {e}")
        return None


def save_transcript(raw_text: str, simplified_text: str, language: str = "English") -> str:
    """
    Save a transcript to Firestore.
    
    Args:
        raw_text: Original transcribed text
        simplified_text: AI-simplified text
        language: Target language
    
    Returns:
        Document ID of the saved transcript, or empty string on failure
    """
    
    db = get_firestore_client()
    
    if db is None:
        return ""
    
    try:
        doc_data = {
            "raw_text": raw_text,
            "simplified_text": simplified_text,
            "language": language,
            "timestamp": datetime.utcnow(),
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # Add document to collection
        doc_ref = db.collection(COLLECTION_NAME).add(doc_data)
        
        return doc_ref[1].id
    
    except Exception as e:
        print(f"Firestore Save Error: {e}")
        return ""


def get_transcript(doc_id: str) -> dict:
    """
    Retrieve a transcript from Firestore.
    
    Args:
        doc_id: Document ID of the transcript
    
    Returns:
        Transcript data dictionary, or empty dict on failure
    """
    
    db = get_firestore_client()
    
    if db is None:
        return {}
    
    try:
        doc_ref = db.collection(COLLECTION_NAME).document(doc_id)
        doc = doc_ref.get()
        
        if doc.exists:
            return doc.to_dict()
        else:
            return {}
    
    except Exception as e:
        print(f"Firestore Get Error: {e}")
        return {}


def get_recent_transcripts(limit: int = 10) -> list:
    """
    Get recent transcripts from Firestore.
    
    Args:
        limit: Maximum number of transcripts to retrieve
    
    Returns:
        List of transcript dictionaries
    """
    
    db = get_firestore_client()
    
    if db is None:
        return []
    
    try:
        docs = (
            db.collection(COLLECTION_NAME)
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )
        
        transcripts = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            transcripts.append(data)
        
        return transcripts
    
    except Exception as e:
        print(f"Firestore Query Error: {e}")
        return []


def delete_transcript(doc_id: str) -> bool:
    """
    Delete a transcript from Firestore.
    
    Args:
        doc_id: Document ID of the transcript
    
    Returns:
        True if deleted successfully, False otherwise
    """
    
    db = get_firestore_client()
    
    if db is None:
        return False
    
    try:
        db.collection(COLLECTION_NAME).document(doc_id).delete()
        return True
    
    except Exception as e:
        print(f"Firestore Delete Error: {e}")
        return False


# Testing module
if __name__ == "__main__":
    print("--- Cloud Firestore Module ---")
    print(f"Collection: {COLLECTION_NAME}")
    print("This module requires Firebase credentials to test.")
