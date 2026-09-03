import io
import math
from PIL import Image, ImageChops, ImageEnhance, ExifTags
import numpy as np

def _perform_ela(image: Image.Image, quality: int = 90) -> dict:
    """
    Performs Error Level Analysis (ELA) to detect compression artifacts.
    """
    try:
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Save the image at the given quality to a memory buffer
        buffer = io.BytesIO()
        image.save(buffer, 'JPEG', quality=quality)
        buffer.seek(0)
        
        # Open the re-saved image
        resaved_image = Image.open(buffer)
        
        # Calculate the absolute difference between the original and re-saved images
        ela_image = ImageChops.difference(image, resaved_image)
        
        # Enhance the difference to make it visible/analyzable
        extrema = ela_image.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        
        if max_diff == 0:
            max_diff = 1
            
        scale = 255.0 / max_diff
        ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)
        
        # Convert to numpy array for statistical analysis
        ela_array = np.array(ela_image)
        
        # Calculate basic statistics
        avg_diff = float(np.mean(ela_array))
        max_diff_val = float(np.max(ela_array))
        
        # A simple heuristic: if the max difference is very high and localized, it might be tampered.
        # This is a baseline algorithm to be replaced by the CNN later.
        score = min((max_diff_val / 255.0) * 0.7 + (avg_diff / 50.0) * 0.3, 1.0)
        
        return {
            "ela_score": float(score),
            "max_difference": max_diff_val,
            "avg_difference": avg_diff
        }
    except Exception as e:
        print(f"Error in ELA: {e}")
        return {"ela_score": 0.0, "max_difference": 0.0, "avg_difference": 0.0}

def _analyze_metadata(image: Image.Image) -> dict:
    """
    Checks EXIF metadata for signs of software manipulation.
    """
    metadata = {}
    software_flag = False
    
    try:
        exif_data = image.getexif()
        if exif_data:
            for tag_id, value in exif_data.items():
                tag = ExifTags.TAGS.get(tag_id, tag_id)
                if tag == 'Software':
                    metadata['software'] = str(value)
                    value_lower = str(value).lower()
                    if 'photoshop' in value_lower or 'gimp' in value_lower or 'paint' in value_lower:
                        software_flag = True
    except Exception as e:
        print(f"Error reading EXIF: {e}")
        
    return {
        "metadata_found": bool(metadata),
        "software": metadata.get("software"),
        "software_manipulation_flag": software_flag
    }

from app.services import stamp_detection

def _text_manipulation_cnn(image: Image.Image) -> dict:
    """
    Placeholder for the Text Manipulation CNN.
    In production, this extracts patches around text (detected via OCR) 
    and passes them through a PyTorch model to detect font/pixel anomalies.
    """
    return {"text_tampered": False, "confidence": 0.0, "note": "Awaiting CNN weights"}

def _photo_boundary_analysis(image: Image.Image) -> dict:
    """
    Placeholder for Photo Edge/Boundary Artifact Detection.
    Looks for splicing artifacts specifically around the portrait region.
    """
    return {"photo_replaced": False, "confidence": 0.0, "note": "Awaiting Region Extractor"}

def detect_tampering(image_bytes: bytes) -> dict:
    """
    Orchestrates ALL tampering detection sub-detectors (Module 3).
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        # 1. Photo Replacement (ELA + Boundary)
        ela_results = _perform_ela(image)
        boundary_results = _photo_boundary_analysis(image)
        
        # 2. Text Manipulation
        text_results = _text_manipulation_cnn(image)
        
        # 3. Stamp/Seal Forgery
        stamp_results = stamp_detection.detect_stamp_forgery(image_bytes)
        
        # 4. Metadata Analysis
        metadata_results = _analyze_metadata(image)
        
        # Combine signals into a final confidence score (0.0 to 1.0)
        confidence = 0.0
        
        # Weighted accumulation
        ela_confidence = ela_results.get("ela_score", 0.0)
        confidence += ela_confidence * 0.4
        
        if metadata_results.get("software_manipulation_flag"):
            confidence += 0.3
            
        if stamp_results.get("is_forged"):
            confidence += 0.2
            
        if text_results.get("text_tampered"):
            confidence += 0.1
            
        # Determine boolean flag
        is_tampered = confidence > 0.5
        
        return {
            "is_tampered": is_tampered,
            "confidence": round(confidence, 3),
            "ela_metrics": ela_results,
            "metadata_metrics": metadata_results,
            "stamp_metrics": stamp_results,
            "text_metrics": text_results
        }
    except Exception as e:
        print(f"Failed to detect tampering: {e}")
        return {"is_tampered": False, "confidence": 0.0, "error": str(e)}
