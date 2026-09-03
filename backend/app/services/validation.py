from datetime import datetime

# Mock local database for prototype
BLACKLISTED_DOCUMENTS = {"L898902C3", "A1234567"}

def validate_document(ocr_results: dict) -> dict:
    """
    Validates document rules including expiry, blacklist, and MRZ checksums.
    """
    validation_results = {
        "is_valid": True,
        "is_valid_id_type": True,
        "checksums_passed": False,
        "is_expired": False,
        "blacklist_match": False,
        "errors": []
    }
    
    parsed_data = ocr_results.get("parsed_mrz_data", {})
    raw_text = ocr_results.get("raw_extracted_text", "").upper()
    
    # 0. Document Type Classification
    # If it has an MRZ, it's definitively an ID (e.g. Passport)
    # Otherwise, check the raw text for government keywords
    id_keywords = ["GOVT", "GOVERNMENT", "INDIA", "INCOME TAX", "AADHAAR", "PASSPORT", "ELECTION", "REPUBLIC", "DRIVING LICENSE"]
    
    has_mrz = bool(parsed_data)
    has_keywords = any(kw in raw_text for kw in id_keywords)
    
    if not has_mrz and not has_keywords:
        validation_results["is_valid_id_type"] = False
        validation_results["is_valid"] = False
        validation_results["errors"].append("Does not appear to be a valid Identity Document.")
    
    if parsed_data:
        # 1. Checksum Validation
        validation_results["checksums_passed"] = parsed_data.get("valid_checksums", False)
        if not validation_results["checksums_passed"]:
            validation_results["is_valid"] = False
            validation_results["errors"].append("MRZ Checksums failed.")
            
        # 2. Expiry Check
        expiry_str = parsed_data.get("expiry_date")
        if expiry_str:
            try:
                # MRZ date format is YYMMDD
                expiry_date = datetime.strptime(expiry_str, "%y%m%d").date()
                today = datetime.now().date()
                if expiry_date < today:
                    validation_results["is_expired"] = True
                    validation_results["is_valid"] = False
                    validation_results["errors"].append(f"Document expired on {expiry_date.isoformat()}")
            except ValueError:
                validation_results["is_valid"] = False
                validation_results["errors"].append("Invalid expiry date format in MRZ.")
        else:
            validation_results["is_valid"] = False
            validation_results["errors"].append("Missing expiry date.")

        # 3. Blacklist Check
        doc_number = parsed_data.get("document_number")
        if doc_number and doc_number in BLACKLISTED_DOCUMENTS:
            validation_results["blacklist_match"] = True
            validation_results["is_valid"] = False
            validation_results["errors"].append("Document number found on blacklist.")
    else:
        # Standard ID (Aadhar/PAN) without MRZ
        validation_results["checksums_passed"] = True # NA
        validation_results["is_expired"] = False # NA
        
    return validation_results
