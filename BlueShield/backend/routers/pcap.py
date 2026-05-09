"""
BlueShield IDS — PCAP Upload Router
Full Pipeline: PCAP → Packets → Features → Model → Database → Website
Endpoints:
  POST /api/pcap/upload
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
import os
import shutil
import uuid
from datetime import datetime

from ..database import get_db
from ..models import TrafficEvent, Alert
from ..ml.inference import model_service
from ..ml.feature_extractor import CICFeatureExtractor

router = APIRouter(prefix="/api/pcap", tags=["pcap"])

# Initialize feature extractor with selected features from metadata
extractor = CICFeatureExtractor(model_service.selected_features)

# Map attack types to severity levels
SEVERITY_MAP = {
    "BENIGN": "Normal",
    "DoS": "High",
    "PortScan": "Medium",
    "BruteForce": "High",
    "WebAttack": "Medium",
    "Bot": "Low",
    "Infiltration": "High",
}

@router.post("/upload")
async def upload_pcap(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.pcap', '.pcapng', '.cap')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PCAP file.")

    # Save file temporarily
    temp_dir = "temp_pcaps"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # ── STEP 1: Extract features from packets ──
        features_df = extractor.extract_features(file_path)
        
        if features_df.empty:
            return {
                "filename": file.filename,
                "status": "No valid flows detected for analysis",
                "analysis": {"total_flows_analyzed": 0, "status": "Safe"}
            }

        # ── STEP 2: Run ML model prediction ──
        # Get metadata columns before dropping them
        meta_cols = ['_src_ip', '_dst_ip', '_timestamp']
        flow_metadata = features_df[meta_cols].copy() if all(c in features_df.columns for c in meta_cols) else None
        
        predictions = model_service.predict_ensemble_batch(features_df)
        
        # ── STEP 3: Save results to Database ──
        total_flows = len(predictions)
        anomalous_count = 0
        threats_set = set()
        
        for i, pred in enumerate(predictions):
            attack_type = pred['class_name']
            severity = SEVERITY_MAP.get(attack_type, "Medium")
            is_attack = pred['is_attack']
            
            # Get IP info from metadata if available
            src_ip = "unknown"
            dst_ip = "unknown"
            if flow_metadata is not None and i < len(flow_metadata):
                src_ip = str(flow_metadata.iloc[i].get('_src_ip', 'unknown'))
                dst_ip = str(flow_metadata.iloc[i].get('_dst_ip', 'unknown'))
            
            # Save every flow as a TrafficEvent in the database
            event = TrafficEvent(
                timestamp=datetime.utcnow(),
                src_ip=src_ip,
                dst_ip=dst_ip,
                src_port=0,
                dst_port=0,
                protocol="TCP",
                attack_type=attack_type,
                severity=severity,
                bytes_sent=0,
                bytes_recv=0,
                duration=0.0,
                blocked=False,
            )
            db.add(event)
            
            # If it's an attack, create an Alert
            if is_attack:
                anomalous_count += 1
                threats_set.add(attack_type)
                
                alert = Alert(
                    title=f"{attack_type} Detected — PCAP Analysis",
                    severity=severity,
                    src_ip=src_ip,
                    dst_ip=dst_ip,
                    attack_type=attack_type,
                    description=f"ML model detected {attack_type} activity from {src_ip} → {dst_ip} (confidence: {pred['confidence']:.0%}). Source: {file.filename}",
                    resolved=False,
                )
                db.add(alert)
        
        # Commit all events and alerts to the database
        db.commit()

        # ── STEP 4: Return results to Frontend ──
        result = {
            "filename": file.filename,
            "content_type": file.content_type,
            "size_bytes": os.path.getsize(file_path),
            "analysis": {
                "total_flows_analyzed": total_flows,
                "anomalous_flows": anomalous_count,
                "threats_detected": list(threats_set),
                "risk_score": round((anomalous_count / max(1, total_flows)) * 100, 1),
                "status": "Safe" if anomalous_count == 0 else "Suspicious"
            }
        }
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(file_path):
            os.remove(file_path)

