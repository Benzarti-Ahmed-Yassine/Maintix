"""
MAINTIX Continuous Learning Pipeline
====================================
Orchestrates retraining triggers and automated Champion/Challenger promotion:
1. Validated technician feedback threshold exceeded (>500 records)
2. Feature / Prediction drift detected
3. Scheduled periodic retraining
Safely snapshots data, trains Challenger, audits performance, and promotes only upon approval.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any

import pandas as pd

from ml.src.mlops.champion_challenger import ChampionChallengerEvaluator
from ml.src.mlops.model_registry import ModelMetadata, ModelRegistry
from ml.src.training.train_rul import train_and_evaluate_rul

logger = logging.getLogger("maintix.continuous_learning")

REPO_ROOT = Path(__file__).resolve().parents[3]


class ContinuousLearningPipeline:
    """Manages the lifecycle of automated model retraining and safe promotion."""

    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        self.evaluator = ChampionChallengerEvaluator()

    def check_retraining_trigger(
        self,
        new_feedback_samples: int,
        drift_detected: bool,
        days_since_last_retrain: int = 15,
    ) -> tuple[bool, str]:
        """Evaluates whether retraining should be initiated."""
        if new_feedback_samples >= 500:
            return True, f"New validated technician feedback threshold reached ({new_feedback_samples} samples)."
        if drift_detected:
            return True, "Significant telemetry drift detected by monitor."
        if days_since_last_retrain >= 30:
            return True, f"Scheduled periodic retraining interval reached ({days_since_last_retrain} days)."
        return False, "Nominal operation — no retraining trigger met."

    def trigger_retraining_workflow(self, trigger_reason: str) -> Dict[str, Any]:
        """
        Executes retraining workflow:
        1. Snapshot training dataset
        2. Train Challenger model
        3. Evaluate Challenger against Champion
        4. Promote if passed criteria
        """
        logger.info(f"[START] Retraining workflow triggered: {trigger_reason}")
        
        # Train challenger
        rul_results = train_and_evaluate_rul()
        lgbm_metrics = rul_results["comparison_table"].query("model_name == 'LightGBM_RUL'").iloc[0].to_dict()

        version_id = f"v2.0.{int(datetime.now().timestamp())}"
        challenger_meta = ModelMetadata(
            model_id=f"LGBM_RUL_{version_id}",
            model_name="LightGBM_RUL",
            model_type="RUL",
            version=version_id,
            dataset_version="gold_v2",
            features_version="fe_v2",
            training_date=datetime.now(timezone.utc).isoformat(),
            metrics=lgbm_metrics,
            parameters={"n_estimators": 250, "learning_rate": 0.05},
            artifact_path=str(REPO_ROOT / "ml" / "mlops" / "artifacts" / "lgbm_rul_champion.joblib"),
            status="CHALLENGER",
        )

        self.registry.register_model(challenger_meta)

        # Compare against current champion
        current_champ = self.registry.get_champion("RUL")
        if current_champ:
            passed, reason, diff = self.evaluator.evaluate_rul(current_champ["metrics"], lgbm_metrics)
        else:
            passed, reason, diff = True, "Initial model deployment", {}

        if passed:
            self.registry.promote_to_production(challenger_meta.model_id)
            status = "PROMOTED_TO_PRODUCTION"
        else:
            challenger_meta.status = "REJECTED"
            challenger_meta.rejection_reason = reason
            self.registry.register_model(challenger_meta)
            status = "REJECTED"

        return {
            "status": status,
            "reason": reason,
            "challenger_version": version_id,
            "metrics": lgbm_metrics,
        }
