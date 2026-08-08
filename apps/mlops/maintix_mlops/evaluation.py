from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, mean_squared_error, precision_score, recall_score


@dataclass
class EvaluationReport:
    metrics: dict[str, float]
    success: bool


class EvaluationService:
    def classification_metrics(self, y_true: pd.Series, y_pred: pd.Series) -> EvaluationReport:
        metrics = {
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "precision": float(precision_score(y_true, y_pred, average="weighted", zero_division=0)),
            "recall": float(recall_score(y_true, y_pred, average="weighted", zero_division=0)),
        }
        return EvaluationReport(metrics=metrics, success=True)

    def regression_metrics(self, y_true: pd.Series, y_pred: pd.Series) -> EvaluationReport:
        metrics = {
            "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
            "mse": float(mean_squared_error(y_true, y_pred)),
        }
        return EvaluationReport(metrics=metrics, success=True)

    def evaluate(self, y_true: pd.Series, y_pred: pd.Series) -> EvaluationReport:
        if pd.api.types.is_numeric_dtype(y_true) and y_true.nunique() > 10:
            return self.regression_metrics(y_true, y_pred)
        return self.classification_metrics(y_true, y_pred)
