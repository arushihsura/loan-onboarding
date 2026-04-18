"""
Whisper service for speech-to-text transcription
"""

from typing import Optional

_whisper_model = None


def _load_whisper():
    """Lazy load Whisper model"""
    global _whisper_model
    if _whisper_model is None:
        try:
            import whisper
            _whisper_model = whisper.load_model("base")
        except Exception as e:
            print(f"Error loading Whisper model: {e}")
            _whisper_model = False  # Mark as failed
    return _whisper_model


def transcribe_audio(audio_path: str) -> Optional[str]:
    """
    Transcribe audio file using Whisper
    
    Args:
        audio_path: Path to audio file
    
    Returns:
        Transcribed text or None if error
    """
    try:
        model = _load_whisper()
        if model is False or model is None:
            return None
        
        result = model.transcribe(audio_path)
        return result.get("text", None)
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return None


def validate_audio_file(audio_path: str) -> bool:
    """
    Validate if audio file exists and is accessible
    
    Args:
        audio_path: Path to audio file
    
    Returns:
        True if file is valid, False otherwise
    """
    import os
    return os.path.exists(audio_path) and os.path.isfile(audio_path)
