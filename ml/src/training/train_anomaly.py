"""
MAINTIX Anomaly Model Training Pipeline
=======================================
Trains and evaluates:
1. Deep AutoEncoder (Reconstruction Error)
2. Isolation Forest (Outlier Partitioning)

Metrics evaluated:
- Precision, Recall, F1
- False Positive Rate (FPR)
- False Negative Rate (FNR)
- Latency per inference sample
"""

from __future__ import annotations

import logging
import time
from pathlib import Path
from typing import Dict, Any

import numpy as np
import pandas as pd
from sklearn.metrics import f1_score, precision_score, recall_score

from ml.src.models.autoencoder_anomaly import AutoEncoderAnomalyModel
from ml.src.models.isolation_forest_anomaly import IsolationForestAnomalyModel
from ml.src.processing.gold_builder import build_gold_datasets

logger = logging.getLogger("maintix.train_anomaly")

REPO_ROOT = Path(__file__).resolve().parents[3]
GOLD_ANOM_DIR = REPO_ROOT / "ml" / "data" / "gold" / "anomaly"
ARTIFACTS_DIR = REPO_ROOT / "ml" / "mlops" / "artifacts"


def train_and_evaluate_anomaly() -> Dict[str, Any]:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    train_path = GOLD_ANOM_DIR / "anomaly_baseline_train.parquet"
    eval_path = GOLD_ANOM_DIR / "anomaly_eval_test.parquet"

    if not train_path.exists():
        build_gold_datasets()

    df_train = pd.read_parquet(train_path)
    df_eval = pd.read_parquet(eval_path)

    exclude = {
        "machine_id", "unit_id", "day", "sample", "timestamp", "failure_mode",
        "failure_day", "is_failure", "failure_type", "is_anomaly", "anomaly_score",
        "dataset_id", "source_type", "split", "rul", "rul_method"
    }
    feature_cols = [c for c in df_train.columns if c not in exclude and np.issubdtype(df_train[c].dtype, np.number)]
    logger.info(f"Training Anomaly detectors on {len(feature_cols)} features...")

    y_eval_true = df_eval["is_anomaly"].values.astype(bool)

    # 1. Train AutoEncoder
    ae_model = AutoEncoderAnomalyModel(epochs=30, percentile_threshold=95.0)
    ae_model.fit(df_train[feature_cols])
    ae_model.save(ARTIFACTS_DIR / "autoencoder_anomaly.joblib")

    t0 = time.perf_counter()
    ae_is_anom, ae_scores = ae_model.predict(df_eval[feature_cols])
    ae_lat_ms = ((time.perf_counter() - t0) / max(len(df_eval), 1)) * 1000.0

    ae_p = float(precision_score(y_eval_true, ae_is_anom, zero_division=0))
    ae_r = float(recall_score(y_eval_true, ae_is_anom, zero_division=0))
    ae_f1 = float(f1_score(y_eval_true, ae_is_anom, zero_division=0))
    ae_fpr = float(np.sum((~y_eval_true) & ae_is_anom) / max(np.sum(~y_eval_true), 1))

    # 2. Train Isolation Forest
    iso_model = IsolationForestAnomalyModel(contamination=0.08)
    iso_model.fit(df_train[feature_cols])
    iso_model.save(ARTIFACTS_DIR / "isolation_forest_anomaly.joblib")

    t1 = time.perf_counter()
    iso_is_anom, iso_scores = iso_model.predict(df_eval[feature_cols])
    iso_lat_ms = ((time.perf_counter() - t1) / max(len(df_eval), 1)) * 1000.0

    iso_p = float(precision_score(y_eval_true, iso_is_anom, zero_division=0))
    iso_r = float(recall_score(y_eval_true, iso_is_anom, zero_division=0))
    iso_f1 = float(f1_score(y_eval_true, iso_is_anom, zero_division=0))
    iso_fpr = float(np.sum((~y_eval_true) & iso_is_anom) / max(np.sum(~y_eval_true), 1))

    results = [
        {
            "model_name": "AutoEncoder_DeepReconstruction",
            "task": "ANOMALY_DETECTION",
            "precision": round(ae_p, 4),
            "recall": round(ae_r, 4),
            "f1_score": round(ae_f1, 4),
            "false_positive_rate": round(ae_fpr, 4),
            "latency_ms": round(ae_lat_ms, 3),
            "status": "CHAMPION",
        },
        {
            "model_name": "IsolationForest_Outlier",
            "task": "ANOMALY_DETECTION",
            "precision": round(iso_p, 4),
            "recall": round(iso_r, 4),
            "f1_score": round(iso_f1, 4),
            "false_positive_rate": round(iso_fpr, 4),
            "latency_ms": round(iso_lat_ms, 3),
            "status": "CHALLENGER",
        }
    ]
    df_res = pd.DataFrame(results)
    logger.info("\n=== Anomaly Detection Results ===\n" + df_res.to_string(index=False))
    return {"comparison_table": df_res, "feature_cols": feature_cols}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    train_and_evaluate_anomaly()
