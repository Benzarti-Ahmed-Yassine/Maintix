from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

from .drift import DriftDetector
from .training import TrainingPipeline


class RetrainingOrchestrator:
    def __init__(self, pipeline: TrainingPipeline, drift_detector: DriftDetector) -> None:
        self.pipeline = pipeline
        self.drift_detector = drift_detector
        self.history_path = Path("./retraining_history.json")

    def should_retrain(self, baseline: Any, current: Any) -> bool:
        result = self.drift_detector.detect_drift(baseline, current)
        return result["drift_detected"]

    def retrain(self, dataset: Any, target_column: str, model_name: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        result = self.pipeline.train(dataset, target_column, model_name, params=params)
        self._record_retraining(model_name, result)
        return result

    def _record_retraining(self, model_name: str, result: dict[str, Any]) -> None:
        history = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "model_name": model_name,
            "run_id": result["run_id"],
            "metrics": result["metrics"],
        }
        self.history_path.write_text(__import__("json").dumps(history, indent=2))
