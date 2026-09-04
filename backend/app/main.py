from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import process, admin
from app.db import audit

# Initialize the audit database on startup
audit.init_db()

app = FastAPI(
    title="Identity Verification System API",
    description="Backend for OCR, Validation, Tampering, and Face Verification",
    version="1.0.0"
)

# Allow CORS for Vercel/Cloudflare 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process.router, prefix="/api/v1/document", tags=["Document Processing"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin API"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Identity Verification API is running."}
