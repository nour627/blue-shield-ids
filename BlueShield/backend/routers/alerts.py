"""
BlueShield IDS — Alerts Router
Endpoints:
  GET /api/alerts
  PATCH /api/alerts/{alert_id}/resolve
  POST /api/alerts/{alert_id}/block
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from ..models import Alert, TrafficEvent

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("")
def get_all_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "severity": a.severity,
            "src_ip": a.src_ip,
            "dst_ip": a.dst_ip,
            "attack_type": a.attack_type,
            "description": a.description,
            "timestamp": a.timestamp.isoformat(),
            "resolved": a.resolved,
        }
        for a in alerts
    ]

@router.patch("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = True
    db.commit()
    db.refresh(alert)
    return {"status": "success", "resolved": True}

@router.post("/{alert_id}/block")
def block_ip(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Update all events with this src_ip to be blocked
    db.query(TrafficEvent).filter(TrafficEvent.src_ip == alert.src_ip).update({"blocked": True})
    
    # Mark alert as resolved since we blocked it
    alert.resolved = True
    db.commit()
    return {"status": "success", "blocked_ip": alert.src_ip, "resolved": True}
