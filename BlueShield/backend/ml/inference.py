import joblib
import pandas as pd
import numpy as np
import os
from typing import List, Dict, Any

# Path to the ML directory
ML_DIR = os.path.dirname(os.path.abspath(__file__))

class IDSModelService:
    def __init__(self):
        self.models = {}
        self.metadata = None
        self.label_encoder = None
        self.selected_features = []
        self.load_resources()

    def load_resources(self):
        """Load metadata and all available models."""
        try:
            # Load Metadata
            meta_path = os.path.join(ML_DIR, 'metadata.pkl')
            if os.path.exists(meta_path):
                self.metadata = joblib.load(meta_path)
                self.selected_features = self.metadata.get('selected_features', [])
                self.label_encoder = self.metadata.get('label_encoder')
                print(f"Loaded metadata with {len(self.selected_features)} features.")

            # Load Models
            model_files = {
                'xgboost': 'xg_model.pkl',
                'random_forest': 'rf_model.pkl',
                'decision_tree': 'dt_model.pkl',
                'extra_trees': 'et_model.pkl',
                'stacked': 'stk_model.pkl'
            }

            for name, filename in model_files.items():
                path = os.path.join(ML_DIR, filename)
                if os.path.exists(path):
                    self.models[name] = joblib.load(path)
                    print(f"Loaded model: {name}")

        except Exception as e:
            print(f"Error loading ML resources: {e}")

    def predict_ensemble(self, feature_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Perform prediction on a SINGLE row using all models and return consensus.
        Used by the /api/predict/manual endpoint.
        """
        if not self.models:
            return {"error": "No models loaded"}

        try:
            X = feature_df[self.selected_features]
        except KeyError as e:
            return {"error": f"Missing features in input: {e}"}

        all_votes = {}
        for name, model in self.models.items():
            pred = model.predict(X)[0]
            label = self.label_encoder.inverse_transform([pred])[0] if self.label_encoder else str(pred)
            all_votes[name] = label

        from collections import Counter
        votes_list = list(all_votes.values())
        consensus = Counter(votes_list).most_common(1)[0][0]
        agreement = votes_list.count(consensus) / len(votes_list)

        return {
            "class_name": consensus,
            "confidence": agreement,
            "all_votes": all_votes,
            "is_attack": consensus != 'BENIGN'
        }

    def predict_ensemble_batch(self, feature_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Perform prediction on MULTIPLE rows (flows from a PCAP file).
        Each flow gets analyzed by all models with majority voting.
        Used by the /api/pcap/upload endpoint.
        """
        from collections import Counter

        if not self.models:
            return [{"error": "No models loaded"}]

        # Drop metadata columns before prediction
        meta_cols = [c for c in feature_df.columns if c.startswith('_')]
        X = feature_df.drop(columns=meta_cols, errors='ignore')

        try:
            X = X[self.selected_features]
        except KeyError as e:
            return [{"error": f"Missing features: {e}"}]

        # Get predictions from all models
        all_model_preds = {}
        for name, model in self.models.items():
            preds = model.predict(X)
            labels = self.label_encoder.inverse_transform(preds) if self.label_encoder else preds
            all_model_preds[name] = labels

        # For each flow, do majority voting
        results = []
        n_flows = len(X)
        for i in range(n_flows):
            votes = [all_model_preds[name][i] for name in all_model_preds]
            consensus = Counter(votes).most_common(1)[0][0]
            agreement = votes.count(consensus) / len(votes)

            results.append({
                "class_name": consensus,
                "confidence": agreement,
                "is_attack": consensus != 'BENIGN'
            })

        return results

# Singleton instance
model_service = IDSModelService()

