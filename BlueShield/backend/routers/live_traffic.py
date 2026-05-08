"""
BlueShield IDS — Live Traffic Router
Endpoints:
  GET /api/live-traffic/stream
"""
from fastapi import APIRouter
import random
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/live-traffic", tags=["live-traffic"])

ATTACK_TYPES = ["Normal", "Normal", "Normal", "Normal", "DoS", "PortScan", "Brute Force", "Web Attack", "Bot", "Infiltration"]
SEVERITIES = {
    "Normal": "Normal",
    "DoS": "High",
    "PortScan": "Medium",
    "Brute Force": "High",
    "Web Attack": "Medium",
    "Bot": "Low",
    "Infiltration": "High",
}
PROTOCOLS = ["TCP", "UDP", "ICMP"]

@router.get("/stream")
def get_live_stream(limit: int = 12):
    """
    Simulates real-time network traffic.
    Generates realistic random events on the fly so the frontend 
    always sees fresh timestamps every 2 seconds.
    """
    events = []
    
    for _ in range(limit):
        attack = random.choice(ATTACK_TYPES)
        severity = SEVERITIES[attack]
        
        events.append({
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "src_ip": f"{random.randint(45, 203)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}" if attack != "Normal" else f"192.168.1.{random.randint(100, 250)}",
            "dst_ip": f"192.168.1.{random.randint(1, 50)}",
            "protocol": random.choice(PROTOCOLS),
            "src_port": random.randint(1024, 65535),
            "dst_port": random.choice([80, 443, 22, 21, 53, 3306, 8080]),
            "attack_type": attack,
            "severity": severity,
            "bytes_total": random.randint(64, 35000),
            "duration": round(random.uniform(0.005, 12.0), 3),
        })
        
    # Sort events by timestamp desc
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    return events
