import cv2
import numpy as np
import io
from PIL import Image

def detect_stamp_forgery(document_image_bytes: bytes, template_path: str = None) -> dict:
    """
    Uses OpenCV Template Matching to verify the presence and quality of an official stamp/seal.
    
    In a real system, you would have a database of stamp templates per country/document.
    For this implementation, we simulate the process or use a generic template if provided.
    """
    if not template_path:
        # Mock logic if no template is provided
        return {
            "stamp_detected": True,
            "match_confidence": 0.85,
            "is_forged": False,
            "note": "Mocked: No template provided"
        }
        
    try:
        # 1. Load document image from bytes
        nparr = np.frombuffer(document_image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Load template image
        template = cv2.imread(template_path, cv2.IMREAD_GRAYSCALE)
        if template is None:
            raise FileNotFoundError("Stamp template not found.")
            
        # 3. Perform Template Matching
        # TM_CCOEFF_NORMED is robust to lighting differences
        res = cv2.matchTemplate(gray_img, template, cv2.TM_CCOEFF_NORMED)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
        
        # 4. Analyze Results
        # If the best match is very low, it might be a crude forgery (e.g., printed instead of stamped)
        # Real stamps have ink bleed that makes them match the template decently but not perfectly.
        threshold = 0.6
        stamp_detected = max_val >= threshold
        
        # Example heuristic: if it matches *too* perfectly (e.g. > 0.98), it might be a digital composite
        # If it matches poorly (e.g. < 0.6), it's missing or a terrible forgery.
        is_forged = not stamp_detected or max_val > 0.98
        
        return {
            "stamp_detected": stamp_detected,
            "match_confidence": float(max_val),
            "is_forged": is_forged,
            "location": max_loc if stamp_detected else None
        }
        
    except Exception as e:
        print(f"Error in stamp detection: {e}")
        return {
            "stamp_detected": False,
            "match_confidence": 0.0,
            "is_forged": False,
            "error": str(e)
        }
