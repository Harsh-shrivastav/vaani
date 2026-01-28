"""
Vaani - Speech-to-Text Module (Google Cloud Speech-to-Text)
Uses Google Cloud Speech-to-Text API for server-side transcription.
"""

from google.cloud import speech
import os
import base64

# Language code mapping
LANGUAGE_CODES = {
    "English": "en-IN",
    "Hindi": "hi-IN",
    "Marathi": "mr-IN",
    "Tamil": "ta-IN",
    "Telugu": "te-IN",
    "Bangla": "bn-IN",
}


def get_speech_client():
    """Initialize and return the Speech-to-Text client."""
    return speech.SpeechClient()


def transcribe_audio(audio_data: bytes, language: str = "English") -> str:
    """
    Transcribes audio data using Google Cloud Speech-to-Text API.
    
    Args:
        audio_data: Raw audio bytes (WAV format, 16-bit PCM)
        language: Language for transcription
    
    Returns:
        Transcribed text string
    """
    
    client = get_speech_client()
    
    # Get language code
    language_code = LANGUAGE_CODES.get(language, "en-IN")
    
    # Configure audio settings
    audio = speech.RecognitionAudio(content=audio_data)
    
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz=48000,
        language_code=language_code,
        enable_automatic_punctuation=True,
        model="latest_long",
    )
    
    try:
        response = client.recognize(config=config, audio=audio)
        
        # Combine all transcription results
        transcript = ""
        for result in response.results:
            transcript += result.alternatives[0].transcript + " "
        
        return transcript.strip()
    
    except Exception as e:
        print(f"Speech-to-Text Error: {e}")
        return ""


def transcribe_audio_streaming(audio_generator, language: str = "English"):
    """
    Performs streaming transcription for real-time audio.
    
    Args:
        audio_generator: Generator yielding audio chunks
        language: Language for transcription
    
    Yields:
        Transcription results as they become available
    """
    
    client = get_speech_client()
    language_code = LANGUAGE_CODES.get(language, "en-IN")
    
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz=48000,
        language_code=language_code,
        enable_automatic_punctuation=True,
    )
    
    streaming_config = speech.StreamingRecognitionConfig(
        config=config,
        interim_results=True,
    )
    
    def request_generator():
        yield speech.StreamingRecognizeRequest(streaming_config=streaming_config)
        for chunk in audio_generator:
            yield speech.StreamingRecognizeRequest(audio_content=chunk)
    
    try:
        responses = client.streaming_recognize(request_generator())
        
        for response in responses:
            for result in response.results:
                yield {
                    "transcript": result.alternatives[0].transcript,
                    "is_final": result.is_final,
                    "confidence": result.alternatives[0].confidence if result.is_final else None
                }
    
    except Exception as e:
        print(f"Streaming Speech-to-Text Error: {e}")
        yield {"transcript": "", "is_final": True, "error": str(e)}


# Testing module
if __name__ == "__main__":
    print("--- Google Cloud Speech-to-Text Module ---")
    print("This module requires audio data to test.")
    print("Use the /transcribe endpoint in the backend API.")
