from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime

from ..database import get_db
from ..models import User, Role, LoginLog, FailedAttempt, SecurityAlert
from ..auth_utils import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

MAX_FAILED_ATTEMPTS = 5

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(request: Request, user_data: dict, db: Session = Depends(get_db)):
    # Validate required fields
    if not all(k in user_data for k in ["username", "email", "password"]):
        raise HTTPException(status_code=400, detail="Missing required fields")
        
    username = user_data["username"]
    email = user_data["email"]
    password = user_data["password"]
    
    # Check if user exists
    db_user = db.query(User).filter((User.username == username) | (User.email == email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
        
    # Get Analyst role by default
    role = db.query(Role).filter(Role.name == "Analyst").first()
    if not role:
        role = Role(name="Analyst")
        db.add(role)
        db.commit()
        db.refresh(role)
        
    # Create user
    hashed_password = get_password_hash(password)
    new_user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        role_id=role.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "username": new_user.username}

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    ip_address = request.client.host
    
    # Check failed attempts
    recent_fails = db.query(FailedAttempt).filter(
        FailedAttempt.username == form_data.username,
        FailedAttempt.timestamp > datetime.utcnow() - timedelta(minutes=15)
    ).count()
    
    if recent_fails >= MAX_FAILED_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account locked out due to too many failed attempts. Try again later or use CAPTCHA (Demo Mode)."
        )
        
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # Auth fail logic
    if not user or not verify_password(form_data.password, user.hashed_password):
        # Log failed attempt
        fail_log = FailedAttempt(username=form_data.username, ip_address=ip_address)
        db.add(fail_log)
        
        # If this failure reaches the max, create a security alert
        if recent_fails + 1 == MAX_FAILED_ATTEMPTS:
            alert = SecurityAlert(
                title="Brute Force Attempt Detected",
                description=f"Multiple failed login attempts for username: {form_data.username} from IP: {ip_address}",
                severity="High"
            )
            db.add(alert)
            
        # Also log in LoginLog
        if user:
            log = LoginLog(user_id=user.id, ip_address=ip_address, user_agent=request.headers.get("user-agent", ""), status="failed")
            db.add(log)
            
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Auth success logic
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.name if user.role else "User"}, expires_delta=access_token_expires
    )
    
    # Clear failed attempts for this user
    db.query(FailedAttempt).filter(FailedAttempt.username == user.username).delete()
    
    # Log successful login
    log = LoginLog(user_id=user.id, ip_address=ip_address, user_agent=request.headers.get("user-agent", ""), status="success")
    db.add(log)
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role_name = current_user.role.name if current_user.role else "Analyst"
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": role_name
    }
