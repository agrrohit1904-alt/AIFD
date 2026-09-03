from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ProcessResponse(BaseModel):
    document_id: str
    risk_score: int
    signals: Dict[str, Any]
    status: str
