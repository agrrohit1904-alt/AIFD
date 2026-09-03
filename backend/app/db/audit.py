import sqlite3
import os
from datetime import datetime
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "audit.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            document_type TEXT,
            face_status TEXT,
            signals_json TEXT
        )
    """)
    conn.commit()
    conn.close()

def log_verification(document_id: str, risk_score: int, signals: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    timestamp = datetime.now().isoformat()
    doc_type = signals.get("document_type", "Unknown")
    
    # Try to extract face status if available in the signals dictionary
    face_status = "Unknown"
    for k, v in signals.items():
        if "face" in k.lower() or "similarity" in k.lower():
            face_status = str(v)
            
    # Also extract document classification if it failed
    if "document_classification" in signals:
        doc_type = "INVALID_DOCUMENT"
        
    cursor.execute(
        "INSERT INTO audit_logs (document_id, timestamp, risk_score, document_type, face_status, signals_json) VALUES (?, ?, ?, ?, ?, ?)",
        (document_id, timestamp, risk_score, doc_type, face_status, json.dumps(signals))
    )
    conn.commit()
    conn.close()

def get_all_logs():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]
