from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..ml.inference import model_service
import pandas as pd

router = APIRouter(prefix="/api/predict", tags=["prediction"])

class PredictRequest(BaseModel):
    features: dict  # Feature name -> Value

@router.post("/manual")
async def predict_manual(req: PredictRequest):
    """
    MANUAL PREDICTION ENDPOINT
    Allows testing the model with specific CICIDS2017 feature values.
    """
    if not model_service.models:
        raise HTTPException(status_code=500, detail="ML Models are not loaded on the server.")

    try:
        # Convert the dictionary to a single-row DataFrame
        df = pd.DataFrame([req.features])
        
        # Fill missing features with 0 to avoid errors
        for feature in model_service.selected_features:
            if feature not in df.columns:
                df[feature] = 0.0
        
        # Run Ensemble Prediction
        result = model_service.predict_ensemble(df)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return {
            "attack_type":  result['class_name'],
            "confidence":   round(result['confidence'], 4),
            "all_votes":    result['all_votes'],
            "is_attack":    result['is_attack']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
