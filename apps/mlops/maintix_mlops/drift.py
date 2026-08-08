from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.stats import ks_2samp


class DriftDetector:
    def __init__(self, threshold: float = 0.1) -> None:
        self.threshold = threshold

    def detect_drift(self, baseline: pd.Series, current: pd.Series) -> dict[str, float]:
        if baseline.empty or current.empty:
            return {"drift_score": 0.0, "drift_detected": False}

        stat, pvalue = ks_2samp(baseline, current)
        drift_score = float(stat)
        return {
            "drift_score": drift_score,
            "drift_detected": drift_score > self.threshold,
            "pvalue": float(pvalue),
        }
