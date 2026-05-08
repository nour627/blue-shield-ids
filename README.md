# BlueShield IDS — Advanced Threat Intelligence Platform

BlueShield is a modern Network Intrusion Detection System (NIDS) and Threat Intelligence platform designed for real-time traffic analysis, automated threat detection, and security operations center (SOC) management.

## 🚀 Key Features

### 🛡️ Core IDS Capabilities
- **Live Traffic Monitoring**: Real-time analysis of network packets.
- **Threat Hunter**: Advanced search and analysis tools for deep dives into suspicious activity.
- **ML Detection Engine**: Multi-model comparison and retraining capabilities for evolving threats.
- **PCAP Analysis**: Support for uploading and analyzing network capture files.

### 🔐 Security & Authentication (New)
- **RBAC (Role-Based Access Control)**: Tiered access for Admins and Analysts.
- **Secure Authentication**: JWT-based session management with persistent secure storage.
- **Brute Force Protection**: Automatic rate limiting and account lockout mechanisms.
- **Smart CAPTCHA**: Mathematical verification triggers after repeated failed login attempts.
- **Security Auditing**: Comprehensive logging of login activity, failed attempts, and admin actions.

### 📊 SOC Admin Dashboard (New)
- **System Metrics**: Real-time stats on active sessions, total users, and security alerts.
- **User Management**: Centralized control over analyst accounts and system privileges.
- **Dark Mode SOC UI**: A premium, high-contrast interface designed for professional security environments.

## 🛠️ Technical Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Bun.
- **Backend**: FastAPI, SQLAlchemy, SQLite, SlowAPI (Rate Limiting).
- **Security**: JWT (Jose), Bcrypt (Passlib), Secure HTTP Headers.

## 🚦 Getting Started

### Prerequisites
- Node.js / Bun
- Python 3.9+

### Backend Setup
```bash
cd BlueShield/backend
pip install -r requirements.txt
# Seed the initial admin user
python seed_admin.py
# Run the server
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd BlueShield/frontend
bun install # or npm install
bun run dev # or npm run dev
```

## 🔑 Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

---
*Created as a Cybersecurity Graduation Project & Penetration Testing Demonstration Platform.*
