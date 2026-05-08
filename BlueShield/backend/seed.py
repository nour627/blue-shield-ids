"""
BlueShield IDS — Database Seeder
Seeds realistic CICIDS2017-style data:
  - 15,420 TrafficEvents for today
  - ~9,000 for yesterday (for % change comparison)
  - 7 recent Alerts
"""
import random
from datetime import datetime, timedelta, date
from .database import SessionLocal, engine
from .models import Base, TrafficEvent, Alert

Base.metadata.create_all(bind=engine)

ATTACK_TYPES = ["Normal", "DoS", "PortScan", "Brute Force", "Web Attack", "Bot", "Infiltration"]
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

# Approximate distribution matching CICIDS2017 ratios
ATTACK_WEIGHTS = [55, 21, 10, 5, 4, 3, 2]

PRIVATE_NETS = [
    ("192.168.1.", range(1, 255)),
    ("10.0.0.", range(1, 100)),
    ("172.16.0.", range(1, 50)),
]

EXTERNAL_IPS = [
    "45.33.32.156", "198.51.100.42", "203.0.113.77",
    "185.220.101.4", "77.88.55.66", "91.108.4.1",
    "104.21.30.45", "162.241.2.3", "52.86.44.1",
]


def random_private_ip():
    net, rng = random.choice(PRIVATE_NETS)
    return f"{net}{random.choice(list(rng))}"


def random_ip(internal=True):
    if internal:
        return random_private_ip()
    return random.choice(EXTERNAL_IPS)


def make_event(ts: datetime) -> dict:
    attack = random.choices(ATTACK_TYPES, weights=ATTACK_WEIGHTS)[0]
    severity = SEVERITIES[attack]
    blocked = attack != "Normal" and random.random() < 0.15
    return dict(
        timestamp=ts,
        src_ip=random_ip(internal=(attack == "Normal")),
        dst_ip=random_ip(internal=True),
        src_port=random.randint(1024, 65535),
        dst_port=random.choice([80, 443, 22, 21, 8080, 3306, 445, 25]),
        protocol=random.choice(PROTOCOLS),
        attack_type=attack,
        severity=severity,
        bytes_sent=random.randint(64, 65535),
        bytes_recv=random.randint(64, 65535),
        duration=round(random.uniform(0.001, 30.0), 4),
        blocked=blocked,
    )


def seed():
    db = SessionLocal()
    try:
        existing = db.query(TrafficEvent).count()
        if existing > 0:
            print(f"[seed] Database already has {existing} events — skipping.")
            return

        today = date.today()
        yesterday = today - timedelta(days=1)

        # --- Today: 15,420 events spread across 24 hours ---
        print("[seed] Seeding today's traffic events …")
        batch = []
        for _ in range(15420):
            ts = datetime.combine(today, datetime.min.time()) + timedelta(
                seconds=random.randint(0, 86399)
            )
            batch.append(TrafficEvent(**make_event(ts)))
            if len(batch) >= 500:
                db.bulk_save_objects(batch)
                db.commit()
                batch = []
        if batch:
            db.bulk_save_objects(batch)
            db.commit()

        # --- Yesterday: ~9,000 events ---
        print("[seed] Seeding yesterday's traffic events …")
        batch = []
        for _ in range(9000):
            ts = datetime.combine(yesterday, datetime.min.time()) + timedelta(
                seconds=random.randint(0, 86399)
            )
            batch.append(TrafficEvent(**make_event(ts)))
            if len(batch) >= 500:
                db.bulk_save_objects(batch)
                db.commit()
                batch = []
        if batch:
            db.bulk_save_objects(batch)
            db.commit()

        # --- Alerts ---
        print("[seed] Seeding alerts …")
        alerts_data = [
            Alert(
                title="DoS — SYN Flood Detected",
                severity="High",
                src_ip="45.33.32.156",
                dst_ip="192.168.1.10",
                attack_type="DoS",
                description="High-volume SYN packets targeting web server port 80. Possible DDoS campaign.",
                timestamp=datetime.utcnow() - timedelta(minutes=5),
                resolved=False,
            ),
            Alert(
                title="SSH Brute Force — 342 Attempts",
                severity="High",
                src_ip="198.51.100.42",
                dst_ip="192.168.1.22",
                attack_type="Brute Force",
                description="Repeated SSH login failures from single external IP. Account lockout triggered.",
                timestamp=datetime.utcnow() - timedelta(minutes=18),
                resolved=False,
            ),
            Alert(
                title="Port Scan — Full TCP Sweep",
                severity="Medium",
                src_ip="203.0.113.77",
                dst_ip="192.168.1.0/24",
                attack_type="PortScan",
                description="Sequential port scan across /24 subnet. Reconnaissance activity suspected.",
                timestamp=datetime.utcnow() - timedelta(minutes=34),
                resolved=False,
            ),
            Alert(
                title="SQL Injection Attempt",
                severity="Medium",
                src_ip="185.220.101.4",
                dst_ip="192.168.1.15",
                attack_type="Web Attack",
                description="Malicious payload detected in HTTP POST parameter. WAF rule triggered.",
                timestamp=datetime.utcnow() - timedelta(hours=1, minutes=12),
                resolved=True,
            ),
            Alert(
                title="Bot Traffic — Credential Stuffing",
                severity="Low",
                src_ip="77.88.55.66",
                dst_ip="192.168.1.10",
                attack_type="Bot",
                description="Automated credential stuffing pattern detected on /api/login endpoint.",
                timestamp=datetime.utcnow() - timedelta(hours=2),
                resolved=False,
            ),
            Alert(
                title="Lateral Movement — Infiltration",
                severity="High",
                src_ip="192.168.1.45",
                dst_ip="192.168.1.100",
                attack_type="Infiltration",
                description="Internal host exhibiting lateral movement behavior consistent with APT infiltration.",
                timestamp=datetime.utcnow() - timedelta(hours=3, minutes=5),
                resolved=False,
            ),
            Alert(
                title="FTP Brute Force",
                severity="Medium",
                src_ip="91.108.4.1",
                dst_ip="192.168.1.5",
                attack_type="Brute Force",
                description="Dictionary attack against FTP service. 180 failed attempts in 10 minutes.",
                timestamp=datetime.utcnow() - timedelta(hours=5),
                resolved=True,
            ),
        ]
        db.bulk_save_objects(alerts_data)
        db.commit()
        print("[seed] ✅ Done — 15,420 today + 9,000 yesterday + 7 alerts seeded.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
