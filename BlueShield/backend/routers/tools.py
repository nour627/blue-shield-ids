from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
import os
import subprocess

from ..database import get_db

router = APIRouter(prefix="/api/tools", tags=["tools"])

@router.get("/search")
def search_vulnerable(query: str = Query(...), db: Session = Depends(get_db)):
    """
    VULNERABLE ENDPOINT: SQL Injection
    This uses raw string interpolation to build a SQL query.
    Practice: ' OR '1'='1
    """
    try:
        # Intentionally vulnerable SQL construction
        sql = f"SELECT * FROM traffic_events WHERE src_ip = '{query}' OR attack_type = '{query}' LIMIT 10"
        result = db.execute(text(sql))
        
        rows = []
        for row in result:
            # Convert Row object to dict
            rows.append({
                "id": row[0],
                "timestamp": row[1],
                "src_ip": row[2],
                "dst_ip": row[3],
                "attack_type": row[6],
                "severity": row[7],
                "status": "Blocked" if row[11] else "Flagged"
            })
        return rows
    except Exception as e:
        return {"error": str(e)}

@router.get("/ping")
def ping_vulnerable(host: str = Query(...)):
    """
    VULNERABLE ENDPOINT: Command Injection
    This passes user input directly to a system shell.
    Practice: 127.0.0.1; ls -la
    """
    try:
        # Intentionally vulnerable shell command
        # On Mac/Linux: ping -c 1 {host}
        # On Windows: ping -n 1 {host}
        cmd = f"ping -c 1 {host}"
        
        # Using os.popen or subprocess.check_output with shell=True is dangerous
        process = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = process.communicate()
        
        return {
            "command": cmd,
            "stdout": stdout,
            "stderr": stderr
        }
    except Exception as e:
        return {"error": str(e)}
