"""
MAINTIX Health Index Calculation Engine
=======================================
Calculates a scientifically grounded, multi-factor Health Index (0-100%)
combining predicted RUL, anomaly score, and failure probability.

Methodology:
Health Index H in [0, 100] is formulated as:
    H = 100 * ( w_rul * f_rul(RUL) + w_anom * (1 - AnomalyScore) + w_fail * (1 - FailureProb) )
Where:
- f_rul(RUL) = min(1.0, (RUL / RUL_nominal) ** gamma)
- AnomalyScore is calibrated reconstruction / outlier score in [0, 1]
- FailureProb is predicted breakdown probability in [0, 1]
"""

from __future__ import annotations

import logging
from typing import Dict, Any, Union

import numpy as np

logger = logging.getLogger("maintix.health_index")


class HealthIndexCalculator:
    """Calculates grounded industrial machine health score."""

    def __init__(
        self,
        rul_weight: float = 0.40,
        anomaly_weight: float = 0.35,
        failure_prob_weight: float = 0.25,
        nominal_rul_days: float = 60.0,
        curve_gamma: float = 1.2,
    ):
        total_w = rul_weight + anomaly_weight + failure_prob_weight
        self.w_rul = rul_weight / total_w
        self.w_anom = anomaly_weight / total_w
        self.w_fail = failure_prob_weight / total_w
        self.nominal_rul = nominal_rul_days
        self.gamma = curve_gamma

    def calculate(
        self,
        rul_days: float | np.ndarray,
        anomaly_score: float | np.ndarray,
        failure_probability: float | np.ndarray,
    ) -> float | np.ndarray:
        """
        Calculates health index from validated model outputs.
        Returns float or array in [0.0, 100.0].
        """
        rul_ratio = np.clip(np.array(rul_days, dtype=float) / self.nominal_rul, 0.0, 1.0)
        rul_factor = rul_ratio ** self.gamma

        anom_factor = 1.0 - np.clip(np.array(anomaly_score, dtype=float), 0.0, 1.0)
        fail_factor = 1.0 - np.clip(np.array(failure_probability, dtype=float), 0.0, 1.0)

        health = 100.0 * (
            self.w_rul * rul_factor +
            self.w_anom * anom_factor +
            self.w_fail * fail_factor
        )

        clipped = np.clip(health, 2.0, 99.5)
        if isinstance(rul_days, (int, float)):
            return float(clipped)
        return clipped
