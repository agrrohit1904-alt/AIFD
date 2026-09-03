from fastapi import APIRouter, UploadFile, File
from app.models.schemas import ProcessResponse
from app.services import preprocessing, ocr, validation, tampering, face, risk_engine
from app.db import audit
import uuid

router = APIRouter()

@router.post("/verify", response_model=ProcessResponse)
async def verify_document(
    document: UploadFile = File(...),
    live_photo: UploadFile = File(...)
):
    # Read image bytes
    doc_content = await document.read()
    live_content = await live_photo.read()
    
    # 1. Preprocess
    pre_results = preprocessing.preprocess_image(doc_content)
    
    # 2. Extract Data (Module 1)
    ocr_data = ocr.extract_ocr(doc_content)
    
    # 3. Validate (Module 2)
    val_results = validation.validate_document(ocr_data)
    
    # 4. Tampering Detection (Module 3)
    tamp_results = tampering.detect_tampering(doc_content)
    
    # 5. Face Verification (Module 4)
    face_results = face.verify_face(doc_content, live_content)
    
    # 6. Risk Scoring
    risk_results = risk_engine.calculate_risk(val_results, tamp_results, face_results, ocr_data)
    
    doc_id = str(uuid.uuid4())
    
    # 7. Audit Logging
    audit.log_verification(doc_id, risk_results["score"], risk_results["signals"])
    
    return ProcessResponse(
        document_id=doc_id,
        risk_score=risk_results["score"],
        signals=risk_results["signals"],
        status="processed"
    )
