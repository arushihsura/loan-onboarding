"""
Computer Vision service for video processing and face detection
"""

import cv2
from typing import Optional, Tuple
import numpy as np

_cv2_loaded = False


def _load_cv2():
    """Lazy load cv2 module"""
    global _cv2_loaded
    if not _cv2_loaded:
        _cv2_loaded = True
    return cv2


def detect_face_in_frame(frame: np.ndarray) -> Tuple[bool, float]:
    """
    Detect faces in video frame using OpenCV
    
    Args:
        frame: Video frame as numpy array
    
    Returns:
        Tuple of (face_detected: bool, confidence: float)
    """
    try:
        cv2_module = _load_cv2()
        
        # Use Haar Cascade for face detection
        face_cascade = cv2_module.CascadeClassifier(
            cv2_module.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        gray = cv2_module.cvtColor(frame, cv2_module.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) > 0:
            # Return true and a confidence based on number of faces detected
            confidence = min(1.0, len(faces) / 3.0)  # Normalize confidence
            return True, confidence
        return False, 0.0
    except Exception as e:
        print(f"Error in face detection: {e}")
        return False, 0.0


def process_video_frame(frame_path: str) -> dict:
    """
    Process a single video frame
    
    Args:
        frame_path: Path to video frame file
    
    Returns:
        Dictionary with frame analysis results
    """
    try:
        cv2_module = _load_cv2()
        frame = cv2_module.imread(frame_path)
        
        face_detected, confidence = detect_face_in_frame(frame)
        
        return {
            "face_detected": face_detected,
            "confidence": confidence,
            "frame_dimensions": frame.shape[:2] if frame is not None else None
        }
    except Exception as e:
        print(f"Error processing video frame: {e}")
        return {
            "face_detected": False,
            "confidence": 0.0,
            "error": str(e)
        }
