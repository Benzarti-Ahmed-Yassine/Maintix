"""
MAINTIX Offline Reinforcement Learning Policy
=============================================
Trains a safe maintenance policy from historical transition logs using Behavior Cloning /
Conservative Policy Learning.

Never explores blindly on real production factories.
Learned policy acts exclusively in advisory mode.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, Any, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

logger = logging.getLogger("maintix.offline_rl")

REPO_ROOT = Path(__file__).resolve().parents[3]
RL_ARTIFACT_PATH = REPO_ROOT / "ml" / "mlops" / "artifacts" / "rl_maintenance_policy.joblib"


class SafeOfflineRLPolicy:
    """Offline Policy Network predicting optimal maintenance action from machine state."""

    ACTION_MAP = {
        "WAIT": 0,
        "INSPECT": 1,
        "SCHEDULE_PREVENTIVE": 2,
        "REPLACE_COMPONENT": 3,
        "STOP_MACHINE": 4,
    }
    INV_ACTION_MAP = {v: k for k, v in ACTION_MAP.items()}

    def __init__(self, n_estimators: int = 150, random_state: int = 42):
        self.model = RandomForestClassifier(n_estimators=n_estimators, random_state=random_state)
        self.is_fitted = False

    def fit_from_transitions(self, df_transitions: pd.DataFrame) -> Dict[str, Any]:
        """Trains policy model from logged state/action transitions."""
        state_cols = [
            "health_index", "rul", "anomaly_score", "failure_probability",
            "production_load", "spare_part_available"
        ]
        
        # Filter valid rows
        valid_df = df_transitions.dropna(subset=state_cols + ["action"])
        X = valid_df[state_cols].values
        # Normalize health & RUL to [0, 1]
        X[:, 0] /= 100.0
        X[:, 1] /= 60.0

        y = valid_df["action"].map(lambda a: self.ACTION_MAP.get(str(a).upper(), 0)).values

        self.model.fit(X, y)
        self.is_fitted = True
        logger.info(f"Offline RL Policy trained on {len(X)} historical transitions.")
        return {"samples": len(X), "classes": list(self.model.classes_)}

    def select_action(self, state_vector: np.ndarray) -> int:
        """Selects discrete maintenance action (0 to 4)."""
        if not self.is_fitted:
            # Rule-based fallback policy
            health = state_vector[0] * 100.0 if state_vector[0] <= 1.0 else state_vector[0]
            if health < 25.0:
                return 3  # REPLACE
            elif health < 50.0:
                return 2  # SCHEDULE_PREVENTIVE
            elif state_vector[2] > 0.5:
                return 1  # INSPECT
            return 0  # WAIT

        feat = state_vector.reshape(1, -1)
        if feat.shape[1] > 6:
            feat = feat[:, :6]
        return int(self.model.predict(feat)[0])

    def save(self, filepath: Path | str = RL_ARTIFACT_PATH) -> None:
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({"model": self.model, "is_fitted": self.is_fitted}, filepath)

    @classmethod
    def load(cls, filepath: Path | str = RL_ARTIFACT_PATH) -> "SafeOfflineRLPolicy":
        inst = cls()
        if Path(filepath).exists():
            data = joblib.load(filepath)
            inst.model = data["model"]
            inst.is_fitted = data.get("is_fitted", True)
        return inst
