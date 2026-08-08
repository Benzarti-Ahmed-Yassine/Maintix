from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import mlflow
from mlflow.tracking import MlflowClient


class MLFlowClient:
    def __init__(self, tracking_uri: str = "sqlite:///mlflow.db", experiment_name: str = "maintix_experiment") -> None:
        self.tracking_uri = tracking_uri
        if self.tracking_uri.startswith("file:"):
            os.environ.setdefault("MLFLOW_ALLOW_FILE_STORE", "true")
        mlflow.set_tracking_uri(self.tracking_uri)
        self.client = MlflowClient()
        self.experiment_id = self._get_or_create_experiment(experiment_name)

    def _get_or_create_experiment(self, name: str) -> str:
        experiment = self.client.get_experiment_by_name(name)
        if experiment is not None:
            return experiment.experiment_id
        return self.client.create_experiment(name)

    def start_run(self, run_name: str, nested: bool = False):
        return mlflow.start_run(experiment_id=self.experiment_id, run_name=run_name, nested=nested)

    def log_params(self, params: dict[str, Any]) -> None:
        for name, value in params.items():
            mlflow.log_param(name, value)

    def log_metrics(self, metrics: dict[str, float]) -> None:
        for name, value in metrics.items():
            mlflow.log_metric(name, value)

    def log_artifact(self, local_path: str | Path, artifact_path: str | None = None) -> None:
        mlflow.log_artifact(str(local_path), artifact_path=artifact_path)

    def register_model(self, model_uri: str, name: str) -> str:
        return self.client.create_registered_model(name) if not self._model_exists(name) else name

    def transition_model_stage(self, model_name: str, version: str, stage: str) -> None:
        self.client.transition_model_version_stage(model_name, version, stage)

    def _model_exists(self, name: str) -> bool:
        try:
            self.client.get_registered_model(name)
            return True
        except mlflow.exceptions.RestException:
            return False
