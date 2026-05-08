"""
BlueShield IDS — FastAPI Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .models import Base
from .routers import dashboard, live_traffic, alerts, models, pcap

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BlueShield IDS API",
    description="Blue Team Network Intrusion Detection System",
    version="1.0.0",
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(live_traffic.router)
app.include_router(alerts.router)
app.include_router(models.router)
app.include_router(pcap.router)


@app.get("/")
def root():
    return {"message": "BlueShield IDS API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
