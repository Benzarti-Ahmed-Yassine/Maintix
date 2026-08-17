"""
MAINTIX Isolation Forest Anomaly Detector
=========================================
Tree-based unsupervised outlier detector for fast multi-sensor telemetry partitioning.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

logger = logging.getLogger("maintix.isolation_forest")


class IsolationForestAnomalyModel:
    """Isolation Forest anomaly detection wrapper."""

    def __init__(self, n_estimators: int = 100, contamination: float = 0.05, random_state: int = 42):
        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            random_state=random_state,
            n_jobs=-1,
        )
        self.is_fitted = False
        self.feature_names: List[str] = []

    def fit(self, X: pd.DataFrame | np.ndarray) -> Dict[str, Any]:
        if isinstance(X, pd.DataFrame):
            self.feature_names = list(X.columns)
        self.model.fit(X)
        self.is_fitted = True
        logger.info("Isolation Forest fitted successfully.")
        return {"status": "fitted", "n_samples": len(X)}

    def predict(self, X: pd.DataFrame | np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Returns:
            is_anomaly (bool array), anomaly_score (0.0 to 1.0)
        """
        raw_pred = self.model.predict(X)  # -1 for anomaly, 1 for normal
        is_anomaly = raw_pred == -1
        
        # Decision function: lower values are more abnormal
        dec_func = self.model.decision_function(X)
        # Normalize to 0 (normal) to 1 (highly anomalous)
        scores = 1.0 - (dec_func - dec_func.min()) / max(dec_func.max() - dec_func.min(), 1e-4)
        return is_anomaly, np.clip(scores, 0.01, 0.99)

    def save(self, filepath: Path | str) -> None:
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({"model": self.model, "feature_names": self.feature_names}, filepath)

    @classmethod
    def load(cls, filepath: Path | str) -> "IsolationForestAnomalyModel":
        data = joblib.load(filepath)
        inst = cls()
        inst.model = data["model"]
        inst.feature_names = data.get("feature_names", [])
        inst.is_fitted = True
        return inst
