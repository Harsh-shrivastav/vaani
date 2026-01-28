"""
Vaani - Storage Module (Firebase Storage)
Handles video asset storage and retrieval from Firebase Storage.
"""

import firebase_admin
from firebase_admin import credentials, storage
import os
from dotenv import load_dotenv

load_dotenv()

# Firebase configuration
FIREBASE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "vaani-app.appspot.com")

# Initialize Firebase Admin SDK (only once)
_initialized = False


def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    global _initialized
    
    if _initialized:
        return
    
    try:
        # Check for service account credentials
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {
                'storageBucket': FIREBASE_BUCKET
            })
        else:
            # Use default credentials (for Cloud Run)
            firebase_admin.initialize_app(options={
                'storageBucket': FIREBASE_BUCKET
            })
        
        _initialized = True
        print("✅ Firebase Storage initialized")
    
    except Exception as e:
        print(f"⚠️ Firebase initialization skipped: {e}")


def get_video_url(word: str) -> str:
    """
    Get the public URL for a sign language video from Firebase Storage.
    
    Args:
        word: The word to get the video for (will be converted to Title Case)
    
    Returns:
        Public URL of the video, or empty string if not found
    """
    
    initialize_firebase()
    
    # Convert to Title Case to match video naming convention
    title_case_word = word.strip().capitalize()
    blob_name = f"sign-videos/{title_case_word}.mp4"
    
    try:
        bucket = storage.bucket()
        blob = bucket.blob(blob_name)
        
        if blob.exists():
            # Generate a signed URL (valid for 1 hour)
            url = blob.generate_signed_url(
                version="v4",
                expiration=3600,  # 1 hour
                method="GET"
            )
            return url
        else:
            return ""
    
    except Exception as e:
        print(f"Storage Error: {e}")
        return ""


def get_video_urls(words: list) -> dict:
    """
    Get public URLs for multiple sign language videos.
    
    Args:
        words: List of words to get videos for
    
    Returns:
        Dictionary mapping words to their video URLs
    """
    
    result = {}
    for word in words:
        url = get_video_url(word)
        if url:
            result[word] = url
    
    return result


def list_available_videos() -> list:
    """
    List all available sign language videos in storage.
    
    Returns:
        List of available words (without .mp4 extension)
    """
    
    initialize_firebase()
    
    try:
        bucket = storage.bucket()
        blobs = bucket.list_blobs(prefix="sign-videos/")
        
        words = []
        for blob in blobs:
            if blob.name.endswith('.mp4'):
                word = blob.name.replace("sign-videos/", "").replace(".mp4", "")
                words.append(word)
        
        return words
    
    except Exception as e:
        print(f"Storage List Error: {e}")
        return []


# For local development - serve from local assets
def get_local_video_path(word: str) -> str:
    """
    Get local video path for development.
    
    Args:
        word: The word to get the video for
    
    Returns:
        Local path to the video file
    """
    title_case_word = word.strip().capitalize()
    return f"assets/{title_case_word}.mp4"


# Testing module
if __name__ == "__main__":
    print("--- Firebase Storage Module ---")
    print(f"Configured bucket: {FIREBASE_BUCKET}")
    print("This module requires Firebase credentials to test cloud features.")
