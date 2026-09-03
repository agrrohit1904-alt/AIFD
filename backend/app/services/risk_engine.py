def calculate_risk(validation_results: dict, tampering_results: dict, face_results: dict, ocr_data: dict = None) -> dict:
    """
    Combines module outputs into a weighted score (0-100).
    Higher score = Higher risk.
    """
    score = 0
    signals = {}
    
    # --- 0. Document Type Data (From OCR) ---
    if ocr_data:
        if ocr_data.get("detected_pan"):
            signals["document_type"] = f"PAN Card Detected ({ocr_data['detected_pan']})"
        elif ocr_data.get("detected_aadhar"):
            signals["document_type"] = f"Aadhar Detected ({ocr_data['detected_aadhar']})"
            
        qr_data = ocr_data.get("qr_data")
        if qr_data:
            signals["qr_code_validated"] = f"Decoded: {qr_data[:30]}..."
            
    # --- 1. Document Validation Signals ---
    
    # Document Classification
    if not validation_results.get("is_valid_id_type", True):
        score += 100
        signals["document_classification"] = "CRITICAL: Image is not a recognized Identity Document!"
        
    # Blacklist Match (Critical Risk)
    if validation_results.get("blacklist_match"):
        score += 80
        signals["blacklist"] = "CRITICAL: Document is on watchlist!"
    else:
        signals["blacklist"] = "Clear"
        
    # Checksum Failure (High Risk)
    if not validation_results.get("checksums_passed", True):
        score += 60
        signals["mrz_checksums"] = "FAILED: MRZ Checksums did not match."
    else:
        signals["mrz_checksums"] = "Passed"
        
    # Document Expiry (Medium Risk)
    if validation_results.get("is_expired"):
        score += 40
        signals["expiry_status"] = "EXPIRED"
    else:
        signals["expiry_status"] = "Valid"
        
    # --- 2. Tampering Signals ---
    tampering_conf = tampering_results.get("confidence", 0.0)
    if tampering_conf > 0.0:
        # Scale tampering confidence (0.0 - 1.0) to risk score (up to 50 points)
        tamp_score = int(tampering_conf * 50)
        score += tamp_score
        
        if tampering_results.get("metadata_metrics", {}).get("software_manipulation_flag"):
            signals["tampering"] = f"HIGH RISK (Conf: {tampering_conf}): Editing software detected."
        elif tampering_conf > 0.5:
            signals["tampering"] = f"HIGH RISK (Conf: {tampering_conf}): Potential image splicing."
        else:
            signals["tampering"] = f"LOW RISK (Conf: {tampering_conf})"
    else:
        signals["tampering"] = "No obvious tampering detected."

    # --- 3. Face Verification Signals ---
    face_status = face_results.get("status", "error")
    face_match = face_results.get("match_score", 0.0)
    
    if face_status == "auto_reject":
        score += 60
        signals["face_verification"] = f"FAILED: Identity mismatch (Score: {face_match})"
    elif face_status == "human_review":
        score += 30
        signals["face_verification"] = f"REVIEW REQUIRED: Borderline match. Possible age gap (Score: {face_match})"
    elif face_status == "auto_approve":
        signals["face_verification"] = f"Passed (Score: {face_match})"
    else:
        score += 50
        signals["face_verification"] = f"ERROR: Face pipeline failed."

    # Cap score at 100
    final_score = min(score, 100)
    
    return {
        "score": final_score,
        "signals": signals
    }
