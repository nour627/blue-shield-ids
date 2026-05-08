# BlueShield IDS — Agent Notes

## Project Status: Task 1 — Dashboard

### Stack
- Frontend: React 18 + Tailwind CSS + Recharts (Vite)
- Backend: FastAPI (Python 3.11) + SQLite (SQLAlchemy)
- ML Engine: scikit-learn + XGBoost (Task 3+)
- Dataset: CICIDS2017

---

## What's Been Built

### Backend ✅
| File | Status | Notes |
|---|---|---|
| `backend/__init__.py` | ✅ Done | Package init |
| `backend/database.py` | ✅ Done | SQLAlchemy engine + SessionLocal |
| `backend/models.py` | ✅ Done | TrafficEvent, Alert ORM models |
| `backend/routers/__init__.py` | ✅ Done | Package init |
| `backend/routers/dashboard.py` | ✅ Done | `/api/dashboard/stats`, `/attack-distribution`, `/recent-alerts` |
| `backend/main.py` | ✅ Done | FastAPI + CORS + router registration |
| `backend/seed.py` | ✅ Done | Seeds 15,420 today + yesterday events + 7 alerts |
| `backend/requirements.txt` | ✅ Done | fastapi, uvicorn, sqlalchemy, python-multipart |

### Frontend ✅
| File | Status | Notes |
|---|---|---|
| Vite scaffold | ✅ Done | Scaffolded manually without npx |
| `src/services/api.js` | ✅ Done | |
| `src/components/Sidebar.jsx` | ✅ Done | |
| `src/components/StatCard.jsx` | ✅ Done | |
| `src/components/AttackDistributionChart.jsx` | ✅ Done | |
| `src/components/RecentAlerts.jsx` | ✅ Done | |
| `src/pages/Dashboard.jsx` | ✅ Done | |
| `src/App.jsx` | ✅ Done | |

---

## API Endpoints (Dashboard)

### `GET /api/dashboard/stats`
```json
{
  "total_events": 15420,
  "pct_change": 8.0,
  "active_threats": 523,
  "need_action": 12,
  "model_accuracy": 97.3,
  "model_name": "Random Forest",
  "blocked_ips": 84
}
```

### `GET /api/dashboard/attack-distribution`
```json
[
  { "attack_type": "Normal", "count": 8500 },
  { "attack_type": "DoS", "count": 3200 },
  ...
]
```

### `GET /api/dashboard/recent-alerts`
```json
[
  { "id": 1, "title": "DoS — SYN Flood", "severity": "High", "src_ip": "192.168.1.45", ... }
]
```

---

## Color System (Severity)
| Severity | Text | Background |
|---|---|---|
| High | `#A32D2D` | `#FCEBEB` |
| Medium | `#854F0B` | `#FAEEDA` |
| Low | `#185FA5` | `#E6F1FB` |
| Normal | `#0F6E56` | `#E1F5EE` |

---

## Pages Roadmap
1. **Dashboard** ← Task 1 (current)
2. **Live Traffic** — real-time table, updates every 2s
3. **Alert Feed** — threats list + detail panel
4. **Model Compare** — accuracy metrics + confusion matrix
5. **PCAP Upload** — file upload + analysis results

---

## Known Issues / Blockers
- Missing Node.js, Python, and Xcode Command Line Tools on this machine. All code for Task 1 backend/frontend is fully built, but a working environment with `node`, `npm`, and `python3` is required to run the servers.

---

## How to Run

### Backend
```bash
cd BlueShield
pip install -r backend/requirements.txt
python -m backend.seed         # seed the database
uvicorn backend.main:app --reload --port 8000
```

### Frontend
```bash
cd BlueShield/frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173  
Backend API at: http://localhost:8000