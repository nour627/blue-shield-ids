"""
BlueShield IDS — Models Router
Endpoints:
  GET /api/models/compare
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("/compare")
def compare_models():
    """
    Returns metrics for various ML models evaluated on CICIDS2017 dataset.
    Normally this would be loaded from a joblib/mlflow experiment, 
    but for this task we provide static representations of model performance.
    """
    return {
        "metrics": [
            {
                "name": "XGBoost",
                "accuracy": 0.985,
                "precision": 0.982,
                "recall": 0.978,
                "f1": 0.980,
                "training_time_sec": 42.5,
                "active": True
            },
            {
                "name": "Random Forest",
                "accuracy": 0.973,
                "precision": 0.965,
                "recall": 0.971,
                "f1": 0.968,
                "training_time_sec": 28.1,
                "active": False
            },
            {
                "name": "Logistic Regression",
                "accuracy": 0.892,
                "precision": 0.865,
                "recall": 0.841,
                "f1": 0.853,
                "training_time_sec": 8.3,
                "active": False
            },
            {
                "name": "SVM",
                "accuracy": 0.921,
                "precision": 0.910,
                "recall": 0.895,
                "f1": 0.902,
                "training_time_sec": 145.2,
                "active": False
            }
        ],
        "confusion_matrix": {
            "classes": ["Normal", "DoS", "PortScan", "Bruteforce"],
            "matrix": [
                [8500, 15, 5, 2],    # True Normal
                [18, 3150, 0, 0],    # True DoS
                [10, 0, 1485, 0],    # True PortScan
                [5, 1, 0, 780]       # True Bruteforce
            ]
        }
    }
