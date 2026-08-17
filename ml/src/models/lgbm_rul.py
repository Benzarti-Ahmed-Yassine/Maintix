"""
MAINTIX LightGBM RUL Regressor
==============================
Gradient-boosted decision tree regressor for Remaining Useful Life (RUL) estimation.
Features:
- Asymmetric loss / RMSE optimization
- Feature importance extraction
- Native SHAP explainability support
- Model serialization & validation
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

logger = logging.getLogger("maintix.lgbm_rul")


class LightGBMRulModel:
    """Production-grade LightGBM RUL regression model with explainability hooks."""

    def __init__(
        self,
        n_estimators: int = 300,
        learning_rate: float = 0.05,
        max_depth: int = 7,
        num_leaves: int = 63,
        min_child_samples: int = 20,
        subsample: float = 0.8,
        colsample_bytree: float = 0.8,
        reg_alpha: float = 0.1,
        reg_lambda: float = 1.0,
        random_state: int = 42,
    ):
        self.params = {
            "n_estimators": n_estimators,
            "learning_rate": learning_rate,
            "max_depth": max_depth,
            "num_leaves": num_leaves,
            "min_child_samples": min_child_samples,
            "subsample": subsample,
            "colsample_bytree": colsample_bytree,
            "reg_alpha": reg_alpha,
            "reg_lambda": reg_lambda,
            "random_state": random_state,
            "n_jobs": -1,
            "verbose": -1,
        }
        self.model = lgb.LGBMRegressor(**self.params)
        self.feature_names: List[str] = []
        self.is_fitted: bool = False

    def fit(
        self,
        X_train: pd.DataFrame | np.ndarray,
        y_train: pd.Series | np.ndarray,
        X_val: Optional[pd.DataFrame | np.ndarray] = None,
        y_val: Optional[pd.Series | np.ndarray] = None,
        feature_names: Optional[List[str]] = None,
    ) -> Dict[str, float]:
        """Trains LightGBM model with optional validation monitoring."""
        if isinstance(X_train, pd.DataFrame):
            self.feature_names = list(X_train.columns)
        elif feature_names:
            self.feature_names = feature_names
        else:
            self.feature_names = [f"feature_{i}" for i in range(X_train.shape[1])]

        eval_set = [(X_val, y_val)] if (X_val is not None and y_val is not None) else None
        
        self.model.fit(
            X_train,
            y_train,
            eval_set=eval_set,
            eval_metric="rmse",
            callbacks=[lgb.early_stopping(stopping_rounds=25, verbose=False)] if eval_set else None
        )
        self.is_fitted = True

        preds_train = self.predict(X_train)
        metrics = {
            "train_mae": float(mean_absolute_error(y_train, preds_train)),
            "train_rmse": float(np.sqrt(mean_squared_error(y_train, preds_train))),
            "train_r2": float(r2_score(y_train, preds_train)),
        }

        if X_val is not None and y_val is not None:
            preds_val = self.predict(X_val)
            metrics.update({
                "val_mae": float(mean_absolute_error(y_val, preds_val)),
                "val_rmse": float(np.sqrt(mean_squared_error(y_val, preds_val))),
                "val_r2": float(r2_score(y_val, preds_val)),
            })

        logger.info(f"LightGBM RUL fitted. Train MAE: {metrics['train_mae']:.2f}, RMSE: {metrics['train_rmse']:.2f}")
        return metrics

    def predict(self, X: pd.DataFrame | np.ndarray) -> np.ndarray:
        """Predicts non-negative Remaining Useful Life."""
        assert self.is_fitted, "Model must be fitted before predict"
        preds = self.model.predict(X)
        return np.clip(preds, 0.0, None)

    def get_feature_importances(self) -> Dict[str, float]:
        """Returns sorted feature importances."""
        if not self.is_fitted:
            return {}
        imps = self.model.feature_importances_
        res = dict(zip(self.feature_names, imps))
        return dict(sorted(res.items(), key=lambda item: item[1], reverse=True))

    def save(self, filepath: Path | str) -> None:
        """Saves model artifact."""
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({"model": self.model, "feature_names": self.feature_names, "params": self.params}, filepath)
        logger.info(f"Model saved -> {filepath}")

    @classmethod
    def load(cls, filepath: Path | str) -> "LightGBMRulModel":
        """Loads model artifact."""
        data = joblib.load(filepath)
        instance = cls(**data.get("params", {}))
        instance.model = data["model"]
        instance.feature_names = data["feature_names"]
        instance.is_fitted = True
        return instance
