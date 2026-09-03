from fastapi import APIRouter
from app.db import audit

router = APIRouter()

@router.get("/logs")
def get_audit_logs():
    """
    Returns all verification audit logs.
    """
    logs = audit.get_all_logs()
    return {"logs": logs}
