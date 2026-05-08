"""
BlueShield IDS — Dashboard Router
Endpoints:
  GET /api/dashboard/stats
  GET /api/dashboard/attack-distribution
  GET /api/dashboard/recent-alerts
  GET /api/dashboard/traffic-timeline
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta, date

from ..database import get_db
from ..models import TrafficEvent, Alert

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    today = date.today()
    yesterday = today - timedelta(days=1)

    # Total events today
    today_count = (
        db.query(func.count(TrafficEvent.id))
        .filter(func.date(TrafficEvent.timestamp) == today)
        .scalar() or 0
    )
    yesterday_count = (
        db.query(func.count(TrafficEvent.id))
        .filter(func.date(TrafficEvent.timestamp) == yesterday)
        .scalar() or 1  # avoid division by zero
    )

    pct_change = round(((today_count - yesterday_count) / yesterday_count) * 100, 1)

    # Active threats = today's non-normal events
    active_threats = (
        db.query(func.count(TrafficEvent.id))
        .filter(
            func.date(TrafficEvent.timestamp) == today,
            TrafficEvent.attack_type != "Normal",
        )
        .scalar() or 0
    )

    # Alerts that need action (unresolved, high/medium)
    need_action = (
        db.query(func.count(Alert.id))
        .filter(Alert.resolved == False, Alert.severity.in_(["High", "Medium"]))
        .scalar() or 0
    )

    # Blocked IPs
    blocked_ips = (
        db.query(func.count(func.distinct(TrafficEvent.src_ip)))
        .filter(TrafficEvent.blocked == True)
        .scalar() or 0
    )

    return {
        "total_events": today_count,
        "pct_change": pct_change,
        "active_threats": active_threats,
        "need_action": need_action,
        "model_accuracy": 97.3,
        "model_name": "Random Forest",
        "blocked_ips": blocked_ips,
    }


@router.get("/attack-distribution")
def get_attack_distribution(db: Session = Depends(get_db)):
    today = date.today()
    rows = (
        db.query(TrafficEvent.attack_type, func.count(TrafficEvent.id).label("count"))
        .filter(func.date(TrafficEvent.timestamp) == today)
        .group_by(TrafficEvent.attack_type)
        .all()
    )
    return [{"attack_type": r.attack_type, "count": r.count} for r in rows]


@router.get("/recent-alerts")
def get_recent_alerts(limit: int = 10, db: Session = Depends(get_db)):
    alerts = (
        db.query(Alert)
        .order_by(Alert.timestamp.desc())
        .limit(limit)
        .all()
    )
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


@router.get("/traffic-timeline")
def get_traffic_timeline(db: Session = Depends(get_db)):
    """Hourly breakdown of today's traffic for the line chart."""
    today = date.today()
    rows = (
        db.query(
            func.strftime("%H", TrafficEvent.timestamp).label("hour"),
            func.count(TrafficEvent.id).label("total"),
            func.sum(
                case((TrafficEvent.attack_type != "Normal", 1), else_=0)
            ).label("threats"),
        )
        .filter(func.date(TrafficEvent.timestamp) == today)
        .group_by("hour")
        .order_by("hour")
        .all()
    )
    return [
        {"hour": f"{r.hour}:00", "total": r.total, "threats": r.threats or 0}
        for r in rows
    ]
