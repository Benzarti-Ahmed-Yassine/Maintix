"""
MAINTIX LightGBM Failure Classifier
====================================
Multi-class component failure and fault mode classifier.
Identifies probable failure mode (Bearing, Motor, Gearbox, Overcurrent, Sensor Fault, etc.)
Outputs:
- failure_type (str)
- failure_probability (float)
- confidence (float)
- class_probabilities (dict)
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, f1_score, precision_score, recall_score
from sklearn.preprocessing import LabelEncoder

logger = logging.getLogger("maintix.lgbm_failure")


class LightGBMFailureClassifier:
    """Multi-class failure mode classification model."""

    def __init__(
        self,
        n_estimators: int = 200,
        learning_rate: float = 0.05,
        max_depth: int = 6,
        num_leaves: int = 31,
        random_state: int = 42,
    ):
        self.params = {
            "n_estimators": n_estimators,
            "learning_rate": learning_rate,
            "max_depth": max_depth,
            "num_leaves": num_leaves,
            "class_weight": "balanced",
            "random_state": random_state,
            "n_jobs": -1,
            "verbose": -1,
        }
        self.model = lgb.LGBMClassifier(**self.params)
        self.label_encoder = LabelEncoder()
        self.feature_names: List[str] = []
        self.classes: List[str] = []
        self.is_fitted = False

    def fit(
        self,
        X: pd.DataFrame | np.ndarray,
        y: pd.Series | np.ndarray | List[str],
        feature_names: Optional[List[str]] = None,
    ) -> Dict[str, float]:
        if isinstance(X, pd.DataFrame):
            self.feature_names = list(X.columns)
        elif feature_names:
            self.feature_names = feature_names

        y_encoded = self.label_encoder.fit_transform(y)
        self.classes = list(self.label_encoder.classes_)

        self.model.fit(X, y_encoded)
        self.is_fitted = True

        preds = self.model.predict(X)
        metrics = {
            "macro_f1": float(f1_score(y_encoded, preds, average="macro", zero_division=0)),
            "macro_precision": float(precision_score(y_encoded, preds, average="macro", zero_division=0)),
            "macro_recall": float(recall_score(y_encoded, preds, average="macro", zero_division=0)),
        }
        logger.info(f"Failure Classifier fitted. Macro F1: {metrics['macro_f1']:.4f}")
        return metrics

    def predict(self, X: pd.DataFrame | np.ndarray) -> Tuple[List[str], np.ndarray, np.ndarray]:
        """
        Returns:
            predicted_types (list of str),
            failure_probabilities (max prob float array),
            confidences (margin over second-best class)
        """
        assert self.is_fitted, "Model must be fitted before predict"
        probs = self.model.predict_proba(X)
        pred_idx = np.argmax(probs, axis=1)
        pred_types = self.label_encoder.inverse_transform(pred_idx)
        
        # Max probability
        max_probs = np.max(probs, axis=1)
        
        # Confidence score (difference between top and 2nd top probability)
        sorted_probs = np.sort(probs, axis=1)
        margin = sorted_probs[:, -1] - (sorted_probs[:, -2] if probs.shape[1] > 1 else 0.0)
        confidence = np.clip(0.60 + 0.38 * margin, 0.50, 0.99)
        
        return list(pred_types), max_probs, confidence

    def save(self, filepath: Path | str) -> None:
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({
            "model": self.model,
            "label_encoder": self.label_encoder,
            "feature_names": self.feature_names,
            "classes": self.classes,
            "params": self.params,
        }, filepath)

    @classmethod
    def load(cls, filepath: Path | str) -> "LightGBMFailureClassifier":
        data = joblib.load(filepath)
        inst = cls(**data.get("params", {}))
        inst.model = data["model"]
        inst.label_encoder = data["label_encoder"]
        inst.feature_names = data.get("feature_names", [])
        inst.classes = data.get("classes", [])
        inst.is_fitted = True
        return inst
