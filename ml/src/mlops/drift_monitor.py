"""
MAINTIX Data & Model Drift Monitor
==================================
Monitors feature distribution drift and prediction drift using:
- Population Stability Index (PSI)
- Kolmogorov-Smirnov (KS) two-sample test
- Mean error drift & anomaly rate shifts
"""

from __future__ import annotations

import logging
from typing import Dict, Any, List

import numpy as np
import pandas as pd
from scipy import stats

logger = logging.getLogger("maintix.drift_monitor")


class DriftMonitor:
    """Monitors telemetry and prediction drift against training baselines."""

    @staticmethod
    def calculate_psi(baseline: np.ndarray, current: np.ndarray, num_buckets: int = 10) -> float:
        """Calculates Population Stability Index (PSI) between baseline and current data."""
        if len(baseline) == 0 or len(current) == 0:
            return 0.0

        quantiles = np.linspace(0, 100, num_buckets + 1)
        bins = np.percentile(baseline, quantiles)
        bins[0] -= 1e-5
        bins[-1] += 1e-5

        base_counts, _ = np.histogram(baseline, bins=bins)
        curr_counts, _ = np.histogram(current, bins=bins)

        base_pct = np.clip(base_counts / max(len(baseline), 1), 1e-4, 1.0)
        curr_pct = np.clip(curr_counts / max(len(current), 1), 1e-4, 1.0)

        psi = np.sum((curr_pct - base_pct) * np.log(curr_pct / base_pct))
        return float(psi)

    @staticmethod
    def check_feature_drift(
        df_baseline: pd.DataFrame,
        df_current: pd.DataFrame,
        feature_cols: List[str],
        psi_threshold: float = 0.20,
        ks_pvalue_threshold: float = 0.05,
    ) -> Dict[str, Any]:
        """
        Audits all feature distributions for significant industrial drift.
        PSI > 0.20 or KS p-value < 0.05 indicates action-required drift.
        """
        drifted_features = []
        feature_report = {}

        for col in feature_cols:
            if col not in df_baseline.columns or col not in df_current.columns:
                continue

            base_vals = df_baseline[col].dropna().values
            curr_vals = df_current[col].dropna().values

            if len(base_vals) < 5 or len(curr_vals) < 5:
                continue

            psi = DriftMonitor.calculate_psi(base_vals, curr_vals)
            ks_stat, p_val = stats.ks_2samp(base_vals, curr_vals)

            is_drifted = psi >= psi_threshold or p_val < ks_pvalue_threshold
            if is_drifted:
                drifted_features.append(col)

            feature_report[col] = {
                "psi": round(psi, 4),
                "ks_statistic": round(float(ks_stat), 4),
                "p_value": round(float(p_val), 4),
                "drift_detected": is_drifted,
            }

        drift_rate = len(drifted_features) / max(len(feature_cols), 1)
        trigger_retraining = drift_rate >= 0.25  # Retrain if 25%+ features shifted

        return {
            "drift_detected": len(drifted_features) > 0,
            "drift_rate_pct": round(drift_rate * 100.0, 1),
            "trigger_retraining": trigger_retraining,
            "drifted_features": drifted_features,
            "feature_details": feature_report,
        }
