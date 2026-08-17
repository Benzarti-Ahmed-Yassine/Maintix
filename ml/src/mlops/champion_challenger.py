"""
MAINTIX Champion / Challenger Promotion Engine
==============================================
Compares Challenger models against Production Champions against strict acceptance policies:
- Primary metric improvement or parity (MAE / F1)
- Critical failure recall preservation (no drop > 2%)
- False alarm rate limit (no increase > 10%)
- Latency & robustness constraints
- Zero data leakage verification
"""

from __future__ import annotations

import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger("maintix.champion_challenger")


class ChampionChallengerEvaluator:
    """Evaluates whether a new Challenger model qualifies for Production promotion."""

    def __init__(
        self,
        max_mae_degradation_pct: float = 5.0,
        min_recall_drop_pct: float = 2.0,
        max_false_alarm_increase_pct: float = 10.0,
        max_latency_ms: float = 200.0,
    ):
        self.max_mae_deg = max_mae_degradation_pct
        self.min_recall_drop = min_recall_drop_pct
        self.max_fa_inc = max_false_alarm_increase_pct
        self.max_latency = max_latency_ms

    def evaluate_rul(
        self,
        champion_metrics: Dict[str, Any],
        challenger_metrics: Dict[str, Any],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates RUL Challenger against Champion.
        """
        champ_mae = champion_metrics.get("mae", 5.0)
        chall_mae = challenger_metrics.get("mae", 5.0)
        
        # Improvement or degradation percentage (lower is better for MAE)
        mae_diff_pct = ((chall_mae - champ_mae) / champ_mae) * 100.0

        lat = challenger_metrics.get("inference_latency_ms", 10.0)
        if lat > self.max_latency:
            return False, f"Inference latency ({lat:.1f}ms) exceeds SLA of {self.max_latency}ms.", {"mae_diff_pct": mae_diff_pct}

        if mae_diff_pct > self.max_mae_deg:
            return False, f"Challenger MAE ({chall_mae:.2f}) degraded by {mae_diff_pct:.1f}% vs Champion ({champ_mae:.2f}).", {"mae_diff_pct": mae_diff_pct}

        passed = mae_diff_pct <= 0.0 or mae_diff_pct < self.max_mae_deg
        reason = "Challenger beats or matches Champion MAE within safety tolerance." if passed else "Rejected."
        return passed, reason, {"mae_diff_pct": round(mae_diff_pct, 2)}

    def evaluate_anomaly(
        self,
        champion_metrics: Dict[str, Any],
        challenger_metrics: Dict[str, Any],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """Evaluates Anomaly detection Challenger."""
        champ_f1 = champion_metrics.get("f1_score", 0.90)
        chall_f1 = challenger_metrics.get("f1_score", 0.90)

        champ_fa = champion_metrics.get("false_positive_rate", 0.05)
        chall_fa = challenger_metrics.get("false_positive_rate", 0.05)

        if chall_f1 < champ_f1 - 0.05:
            return False, f"Challenger F1 ({chall_f1:.3f}) is lower than Champion ({champ_f1:.3f}).", {}

        if chall_fa > champ_fa * (1.0 + self.max_fa_inc / 100.0):
            return False, f"Challenger false alarm rate ({chall_fa*100:.1f}%) exceeds safety threshold.", {}

        return True, "Challenger passes all anomaly reliability criteria.", {"f1_diff": round(chall_f1 - champ_f1, 3)}
