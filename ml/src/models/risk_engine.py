"""
MAINTIX Plant Risk Engine
=========================
Combines RUL, failure probability, anomaly score, machine criticality,
and production bottleneck impact into an actionable asset risk assessment.

Outputs:
- risk_score (0.0 to 1.0)
- risk_level (LOW, MEDIUM, HIGH, CRITICAL)
- risk_reason (diagnostic explanation)
"""

from __future__ import annotations

import logging
from typing import Dict, Any, Tuple

import numpy as np

logger = logging.getLogger("maintix.risk_engine")


class RiskEngine:
    """Configurable plant-wide asset reliability & operational risk scoring engine."""

    CRITICALITY_WEIGHTS = {
        "CRITICAL": 1.0,
        "HIGH": 0.8,
        "MEDIUM": 0.5,
        "LOW": 0.2,
    }

    def __init__(
        self,
        rul_weight: float = 0.35,
        failure_prob_weight: float = 0.30,
        anomaly_weight: float = 0.20,
        criticality_weight: float = 0.15,
        nominal_rul_days: float = 60.0,
    ):
        total = rul_weight + failure_prob_weight + anomaly_weight + criticality_weight
        self.w_rul = rul_weight / total
        self.w_fail = failure_prob_weight / total
        self.w_anom = anomaly_weight / total
        self.w_crit = criticality_weight / total
        self.nominal_rul = nominal_rul_days

    def evaluate_risk(
        self,
        rul_days: float,
        failure_prob: float,
        anomaly_score: float,
        criticality: str = "HIGH",
        production_impact_usd: float = 1850.0,
    ) -> Dict[str, Any]:
        """
        Calculates composite risk score and generates diagnostic root cause reasoning.
        """
        # RUL risk: 1.0 if RUL=0, 0.0 if RUL >= nominal
        rul_risk = 1.0 - min(1.0, max(0.0, rul_days / self.nominal_rul))
        fail_risk = min(1.0, max(0.0, failure_prob))
        anom_risk = min(1.0, max(0.0, anomaly_score))
        crit_factor = self.CRITICALITY_WEIGHTS.get(criticality.upper(), 0.7)

        raw_score = (
            self.w_rul * rul_risk +
            self.w_fail * fail_risk +
            self.w_anom * anom_risk +
            self.w_crit * crit_factor
        )

        risk_score = float(np.clip(raw_score, 0.01, 0.99))

        # Determine level & reasons
        reasons = []
        if risk_score >= 0.75:
            risk_level = "CRITICAL"
            if rul_days <= 15:
                reasons.append(f"Predicted RUL is critically depleted ({rul_days:.0f} days remaining)")
            if failure_prob >= 0.70:
                reasons.append(f"Failure probability is high ({failure_prob*100:.1f}%)")
            if anomaly_score >= 0.70:
                reasons.append("Severe multi-sensor vibration/thermal anomaly detected")
            if crit_factor >= 0.8:
                reasons.append(f"Machine is high criticality asset on production line (${production_impact_usd:.0f}/hr downtime risk)")
        elif risk_score >= 0.50:
            risk_level = "HIGH"
            if rul_days <= 30:
                reasons.append(f"RUL entering warning zone ({rul_days:.0f} days)")
            if anomaly_score >= 0.45:
                reasons.append("Elevated sensor drift observed")
        elif risk_score >= 0.25:
            risk_level = "MEDIUM"
            reasons.append("Minor operational fluctuation within tolerable boundaries")
        else:
            risk_level = "LOW"
            reasons.append("Nominal condition; operating within ISO 10816 standards")

        risk_reason = " | ".join(reasons) if reasons else "Nominal operating envelope."

        return {
            "risk_score": round(risk_score, 4),
            "risk_level": risk_level,
            "risk_reason": risk_reason,
            "components": {
                "rul_risk": round(rul_risk, 3),
                "failure_risk": round(fail_risk, 3),
                "anomaly_risk": round(anom_risk, 3),
                "criticality_factor": crit_factor,
            }
        }
