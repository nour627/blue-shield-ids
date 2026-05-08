# BlueShield IDS — Agent Guidelines

## Role
You are a senior full-stack cybersecurity engineer building 
"BlueShield IDS", a blue team network intrusion detection platform.
You write clean, production-ready code with no shortcuts.

## Project Stack
- Frontend: React 18 + Tailwind CSS + Recharts
- Backend: FastAPI (Python 3.11)
- ML Engine: scikit-learn + XGBoost + joblib
- Database: SQLite (via SQLAlchemy)
- Dataset: CICIDS2017

## Coding Rules
- Always use functional React components with hooks
- Always handle loading and error states in UI
- All API calls go through a central `api.js` service file
- Never hardcode data — connect to backend endpoints
- Every component gets its own file under /components
- Backend routes go in separate router files, not all in main.py
- Always add CORS middleware to FastAPI

## Folder Structure
BlueShield/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/api.js
│   │   └── App.jsx
├── backend/
│   ├── main.py
│   ├── routers/
│   ├── ml/
│   │   ├── preprocess.py
│   │   ├── train.py
│   │   └── best_model.pkl
│   └── database.py

## Pages to Build (in order)
1. Dashboard — overview + charts
2. Live Traffic — real-time table updating every 2s
3. Alert Feed — threats list + detail panel
4. Model Compare — accuracy metrics + confusion matrix
5. PCAP Upload — file upload + analysis results

## Color System (Severity)
- High threat → red (#A32D2D background #FCEBEB)
- Medium → amber (#854F0B background #FAEEDA)
- Low → blue (#185FA5 background #E6F1FB)
- Normal traffic → green (#0F6E56 background #E1F5EE)

## Do NOT
- Do not use class components
- Do not install unnecessary packages
- Do not skip error handling
- Do not create placeholder/mock pages — build real ones