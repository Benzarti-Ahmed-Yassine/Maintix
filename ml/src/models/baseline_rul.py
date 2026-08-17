"""
MAINTIX RUL Baselines
=====================
Reference baseline models for Remaining Useful Life (RUL) regression benchmarks:
1. LastValueBaseline: Predicts mean or constant degradation rate based on last observed cycle.
2. LinearDegradationBaseline: Fits individual linear regression degradation trajectory per asset.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, RegressorMixin


class LastValueBaseline(BaseEstimator, RegressorMixin):
    """Simple baseline predicting historical median RUL or constant remaining value."""

    def __init__(self, max_rul: float = 125.0):
        self.max_rul = max_rul
        self.mean_rul_ = 60.0

    def fit(self, X: np.ndarray, y: np.ndarray):
        self.mean_rul_ = float(np.mean(y))
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return np.full(shape=(len(X),), fill_value=self.mean_rul_)


class LinearDegradationBaseline(BaseEstimator, RegressorMixin):
    """
    Fits a linear degradation slope against the primary degradation proxy signal (e.g. vibration or temperature).
    """

    def __init__(self, failure_threshold: float = 10.0, max_rul: float = 125.0):
        self.failure_threshold = failure_threshold
        self.max_rul = max_rul
        self.slope_ = -0.5
        self.intercept_ = 100.0

    def fit(self, X: np.ndarray, y: np.ndarray):
        # Fit on 1st feature (assumed primary signal)
        x_signal = X[:, 0] if X.ndim > 1 else X
        # Least squares line fit
        A = np.vstack([x_signal, np.ones(len(x_signal))]).T
        m, c = np.linalg.lstsq(A, y, rcond=None)[0]
        self.slope_ = float(m)
        self.intercept_ = float(c)
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        x_signal = X[:, 0] if X.ndim > 1 else X
        preds = self.slope_ * x_signal + self.intercept_
        return np.clip(preds, 0.0, self.max_rul)
