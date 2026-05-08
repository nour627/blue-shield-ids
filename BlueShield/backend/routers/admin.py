from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User, LoginLog, FailedAttempt, SecurityAlert, Role
from ..dependencies import get_current_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    user_count = db.query(User).count()
    active_sessions = db.query(LoginLog).filter(LoginLog.status == "success").group_by(LoginLog.user_id).count() # Simplified logic
    security_alerts = db.query(SecurityAlert).filter(SecurityAlert.resolved == False).count()
    failed_logins = db.query(FailedAttempt).count()
    
    return {
        "totalUsers": user_count,
        "activeSessions": active_sessions,
        "openAlerts": security_alerts,
        "failedLogins": failed_logins
    }

@router.get("/users")
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "email": u.email, "role": u.role.name if u.role else "Unknown", "isActive": u.is_active} for u in users]

@router.get("/logs/login")
def get_login_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    logs = db.query(LoginLog).order_by(LoginLog.timestamp.desc()).limit(50).all()
    return [{"id": l.id, "username": l.user.username if l.user else "Unknown", "ip": l.ip_address, "status": l.status, "timestamp": l.timestamp} for l in logs]

@router.get("/alerts")
def get_security_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    alerts = db.query(SecurityAlert).order_by(SecurityAlert.timestamp.desc()).limit(50).all()
    return [{"id": a.id, "title": a.title, "severity": a.severity, "description": a.description, "timestamp": a.timestamp, "resolved": a.resolved} for a in alerts]
