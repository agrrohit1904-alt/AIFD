from mrz.checker.td3 import TD3CodeChecker
import pytesseract
from PIL import Image
import io
import re
import os
from pyzbar.pyzbar import decode

# Only set explicit path on Windows. On Linux (HuggingFace), it's in the system PATH.
if os.name == 'nt':
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def parse_mrz(mrz_text: str) -> dict:
    """
    Parses a TD3 (Passport) MRZ string and extracts structured fields.
    Also validates the checksums.
    """
    try:
        checker = TD3CodeChecker(mrz_text)
        is_valid = bool(checker)
        fields = checker.fields()
        
        return {
            "valid_checksums": is_valid,
            "document_type": fields.document_type,
            "country": fields.country,
            "surname": fields.surname,
            "name": fields.name,
            "document_number": fields.document_number,
            "nationality": fields.nationality,
            "birth_date": fields.birth_date,
            "sex": fields.sex,
            "expiry_date": fields.expiry_date,
            "optional_data": fields.optional_data
        }
    except Exception as e:
        return {
            "valid_checksums": False,
            "error": "No valid MRZ detected"
        }

def _extract_raw_text(image: Image.Image) -> str:
    """
    Uses Tesseract OCR to pull raw text from the document image.
    """
    try:
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"Tesseract Error: {e}")
        return ""

def extract_ocr(image_bytes: bytes) -> dict:
    """
    Orchestrates the OCR pipeline:
    1. Extracts raw text via Tesseract (for Aadhar/PAN cards)
    2. Attempts to parse MRZ
    3. Attempts to parse QR Codes
    """
    image = Image.open(io.BytesIO(image_bytes))
    
    # Extract QR data using pyzbar
    qr_data = None
    try:
        decoded_objects = decode(image)
        if decoded_objects:
            qr_data = decoded_objects[0].data.decode('utf-8')
    except Exception as e:
        print(f"QR Extraction Error: {e}")

    # Extract raw text from the document
    raw_text = _extract_raw_text(image)
    
    # Try to parse an MRZ from the raw text
    mrz_match = re.search(r'(P<[\w<]{42}\n[\w<]{44})', raw_text)
    
    if mrz_match:
        mrz_text = mrz_match.group(1)
        structured_data = parse_mrz(mrz_text)
        source = "Extracted from Image"
    else:
        # Aadhar/PAN cards don't have MRZs. Return empty MRZ data.
        structured_data = {}
        source = "No MRZ Found (Standard ID)"
        
    # Also extract Aadhar or PAN specific patterns from the raw text for the dashboard
    # PAN format: 5 letters, 4 numbers, 1 letter
    pan_match = re.search(r'[A-Z]{5}[0-9]{4}[A-Z]{1}', raw_text)
    # Aadhar format: 12 digits (often spaced as 4 4 4)
    aadhar_match = re.search(r'\b\d{4}\s?\d{4}\s?\d{4}\b', raw_text)

    return {
        "raw_extracted_text": raw_text[:300] + "..." if len(raw_text) > 300 else raw_text, # Trim for UI
        "mrz_source": source,
        "parsed_mrz_data": structured_data,
        "detected_pan": pan_match.group(0) if pan_match else None,
        "detected_aadhar": aadhar_match.group(0) if aadhar_match else None,
        "qr_data": qr_data
    }
