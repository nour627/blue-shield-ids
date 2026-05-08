"""
BlueShield IDS — ORM Models
TrafficEvent and Alert tables
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class TrafficEvent(Base):
    __tablename__ = "traffic_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    src_ip = Column(String, nullable=False)
    dst_ip = Column(String, nullable=False)
    src_port = Column(Integer, nullable=False)
    dst_port = Column(Integer, nullable=False)
    protocol = Column(String, nullable=False)
    attack_type = Column(String, default="Normal")  # Normal / DoS / PortScan / Brute Force / Web Attack / Bot / Infiltration
    severity = Column(String, default="Normal")     # Normal / Low / Medium / High
    bytes_sent = Column(Integer, default=0)
    bytes_recv = Column(Integer, default=0)
    duration = Column(Float, default=0.0)
    blocked = Column(Boolean, default=False)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    title = Column(String, nullable=False)
    severity = Column(String, nullable=False)   # High / Medium / Low
    src_ip = Column(String, nullable=False)
    dst_ip = Column(String, nullable=False)
    attack_type = Column(String, nullable=False)
    description = Column(String, default="")
    resolved = Column(Boolean, default=False)


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role_id = Column(Integer, ForeignKey("roles.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    role = relationship("Role")


class LoginLog(Base):
    __tablename__ = "login_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ip_address = Column(String)
    user_agent = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String) # "success" or "failed"

    user = relationship("User")


class FailedAttempt(Base):
    __tablename__ = "failed_attempts"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    ip_address = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)


class AdminActivityLog(Base):
    __tablename__ = "admin_activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    target = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    admin = relationship("User")


class SecurityAlert(Base):
    __tablename__ = "security_alerts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    severity = Column(String) # "High", "Medium", "Low"
    timestamp = Column(DateTime, default=datetime.utcnow)
    resolved = Column(Boolean, default=False)
