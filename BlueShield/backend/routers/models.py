"""
BlueShield IDS — Models Router
Endpoints:
  GET /api/models/compare
"""
from fastapi import APIRouter
from ..ml.inference import model_service

router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("/compare")
def compare_models():
    """
    Returns info about the real ML models loaded on the server.
    """
    loaded_models = []
    for name in model_service.models:
        loaded_models.append({
            "name": name,
            "loaded": True,
            "active": name == "xgboost"
        })

    return {
        "metrics": loaded_models,
        "selected_features": model_service.selected_features,
        "n_features": len(model_service.selected_features),
        "classes": list(model_service.label_encoder.classes_) if model_service.label_encoder else [],
        "n_classes": model_service.metadata.get('n_classes', 0) if model_service.metadata else 0
    }

