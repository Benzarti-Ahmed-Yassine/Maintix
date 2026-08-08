from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split

from .storage import ArtifactStorage
from .mlflow_client import MLFlowClient
from .validation import DataValidator, ModelValidator
from .evaluation import EvaluationService


class TrainingPipeline:
    def __init__(
        self,
        tracking_uri: str | Path = "sqlite:///mlflow.db",
        artifact_root: str | Path = "./artifacts",
    ) -> None:
        self.mlflow = MLFlowClient(str(tracking_uri))
        self.storage = ArtifactStorage(artifact_root)
        self.evaluator = EvaluationService()
        self.data_validator = DataValidator()
        self.model_validator = ModelValidator()

    def train(self, dataset: pd.DataFrame, target_column: str, model_name: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        params = params or {}
        validation = self.data_validator.validate(dataset, target_column)
        if not validation.success:
            raise ValueError("Dataset validation failed: " + "; ".join(validation.errors))

        X = dataset.drop(columns=[target_column])
        y = dataset[target_column]
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        model = self._create_model(X_train, y_train, params)
        model.fit(X_train, y_train)

        predictions = model.predict(X_test)
        report = self.evaluator.evaluate(y_test, pd.Series(predictions, index=y_test.index))
        self.model_validator.validate_model(model, report)

        model_path = self.storage.save_model(model, model_name)
        with self.mlflow.start_run(model_name) as run:
            self.mlflow.log_params(params)
            self.mlflow.log_metrics(report.metrics)
            self.mlflow.log_artifact(model_path)

        return {
            "model_path": str(model_path),
            "metrics": report.metrics,
            "run_id": run.info.run_id,
        }

    def _create_model(self, X: pd.DataFrame, y: pd.Series, params: dict[str, Any]) -> Any:
        if pd.api.types.is_numeric_dtype(y) and y.nunique() > 10:
            return RandomForestRegressor(**params)
        return RandomForestClassifier(**params)
