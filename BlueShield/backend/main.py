"""
BlueShield IDS — FastAPI Entry Point
"""
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .database import engine
from .models import Base
from .routers import dashboard, live_traffic, alerts, models, pcap, auth, admin, tools, predict

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BlueShield IDS API",
    description="Blue Team Network Intrusion Detection System",
    version="1.0.0",
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

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
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(tools.router)
app.include_router(predict.router)


@app.get("/")
def root():
    return {"message": "BlueShield IDS API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
