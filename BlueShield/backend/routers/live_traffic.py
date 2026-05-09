"""
BlueShield IDS — Live Traffic Router
Endpoints:
  GET /api/live-traffic/stream
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import TrafficEvent

router = APIRouter(prefix="/api/live-traffic", tags=["live-traffic"])

@router.get("/stream")
def get_live_stream(limit: int = 50, db: Session = Depends(get_db)):
    """
    Returns the latest traffic events from the database.
    Data is populated when a PCAP file is uploaded and analyzed.
    """
    events = (
        db.query(TrafficEvent)
        .order_by(TrafficEvent.timestamp.desc())
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": str(e.id),
            "timestamp": e.timestamp.isoformat() + "Z",
            "src_ip": e.src_ip,
            "dst_ip": e.dst_ip,
            "src_port": e.src_port,
            "dst_port": e.dst_port,
            "protocol": e.protocol,
            "attack_type": e.attack_type,
            "severity": e.severity,
            "bytes_total": e.bytes_sent + e.bytes_recv,
            "duration": e.duration,
        }
        for e in events
    ]
