"""
BlueShield IDS — ORM Models
TrafficEvent and Alert tables
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
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
