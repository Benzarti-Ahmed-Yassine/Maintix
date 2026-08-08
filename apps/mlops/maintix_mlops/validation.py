from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import pandas as pd


@dataclass
class ValidationResult:
    success: bool
    errors: list[str]


class DataValidator:
    def validate(self, dataset: pd.DataFrame, target_column: str) -> ValidationResult:
        errors: list[str] = []
        if target_column not in dataset.columns:
            errors.append(f"Target column '{target_column}' is missing")
        if dataset.empty:
            errors.append("Dataset is empty")
        if dataset.isna().any().any():
            errors.append("Dataset contains null values")
        return ValidationResult(success=not errors, errors=errors)


class ModelValidator:
    def validate_model(self, model: Any, report: ValidationResult) -> ValidationResult:
        if not report.success:
            raise ValueError("Model validation failed: " + "; ".join(report.errors))
        return report
