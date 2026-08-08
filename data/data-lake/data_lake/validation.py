from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import pandas as pd


@dataclass
class ValidationResult:
    success: bool
    errors: list[str]


class SchemaValidator:
    def __init__(self, required_columns: list[str], column_types: dict[str, type] | None = None, allow_nulls: dict[str, bool] | None = None) -> None:
        self.required_columns = required_columns
        self.column_types = column_types or {}
        self.allow_nulls = allow_nulls or {}

    def validate_dataframe(self, dataframe: pd.DataFrame) -> ValidationResult:
        errors: list[str] = []

        for column in self.required_columns:
            if column not in dataframe.columns:
                errors.append(f"Missing required column: {column}")

        for column, expected_type in self.column_types.items():
            if column not in dataframe.columns:
                continue
            actual_dtype = dataframe[column].dtype
            if not self._dtype_matches(actual_dtype, expected_type):
                errors.append(f"Column '{column}' expected {expected_type.__name__} but got {actual_dtype}")

        for column, allow_null in self.allow_nulls.items():
            if column not in dataframe.columns:
                continue
            if not allow_null and dataframe[column].isna().any():
                errors.append(f"Column '{column}' contains null values but nulls are not allowed")

        return ValidationResult(success=not errors, errors=errors)

    def _dtype_matches(self, dtype: Any, expected: type) -> bool:
        if expected is str:
            return pd.api.types.is_string_dtype(dtype)
        if expected is int:
            return pd.api.types.is_integer_dtype(dtype)
        if expected is float:
            return pd.api.types.is_float_dtype(dtype)
        if expected is bool:
            return pd.api.types.is_bool_dtype(dtype)
        return True
