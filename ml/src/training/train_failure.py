"""
MAINTIX Failure Classification Training Pipeline
=================================================
Trains LightGBM Multi-Class Component Failure Classifier.
Evaluates Precision, Recall, Macro-F1 across failure modes.
"""

from __future__ import annotations

import logging
import time
from pathlib import Path
from typing import Dict, Any

import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

from ml.src.models.lgbm_failure import LightGBMFailureClassifier
from ml.src.processing.gold_builder import build_gold_datasets

logger = logging.getLogger("maintix.train_failure")

REPO_ROOT = Path(__file__).resolve().parents[3]
GOLD_FAIL_DIR = REPO_ROOT / "ml" / "data" / "gold" / "failure"
ARTIFACTS_DIR = REPO_ROOT / "ml" / "mlops" / "artifacts"


def train_and_evaluate_failure() -> Dict[str, Any]:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    gold_path = GOLD_FAIL_DIR / "failure_classification_gold.parquet"

    if not gold_path.exists():
        build_gold_datasets()

    df = pd.read_parquet(gold_path)
    exclude = {
        "machine_id", "unit_id", "day", "sample", "timestamp", "failure_mode",
        "failure_day", "is_failure", "failure_type", "is_anomaly", "anomaly_score",
        "dataset_id", "source_type", "split", "rul", "rul_method"
    }
    feature_cols = [c for c in df.columns if c not in exclude and np.issubdtype(df[c].dtype, np.number)]
    
    # Train / test split
    df_train, df_test = train_test_split(df, test_size=0.25, random_state=42, stratify=df["failure_type"])

    classifier = LightGBMFailureClassifier(n_estimators=150, learning_rate=0.05)
    classifier.fit(df_train[feature_cols], df_train["failure_type"])
    classifier.save(ARTIFACTS_DIR / "lgbm_failure_champion.joblib")

    t0 = time.perf_counter()
    preds, max_probs, confs = classifier.predict(df_test[feature_cols])
    lat_ms = ((time.perf_counter() - t0) / max(len(df_test), 1)) * 1000.0

    y_test = df_test["failure_type"].values
    f1 = float(f1_score(y_test, preds, average="macro", zero_division=0))
    p = float(precision_score(y_test, preds, average="macro", zero_division=0))
    r = float(recall_score(y_test, preds, average="macro", zero_division=0))

    results = [{
        "model_name": "LightGBM_MultiClass_Failure",
        "task": "FAILURE_CLASSIFICATION",
        "macro_precision": round(p, 4),
        "macro_recall": round(r, 4),
        "macro_f1": round(f1, 4),
        "latency_ms": round(lat_ms, 3),
        "num_classes": len(classifier.classes),
        "classes": ", ".join(classifier.classes),
        "status": "CHAMPION",
    }]

    df_res = pd.DataFrame(results)
    logger.info("\n=== Failure Classification Results ===\n" + df_res.to_string(index=False))
    return {"comparison_table": df_res, "feature_cols": feature_cols, "classes": classifier.classes}


if __name__ == "__main__":
    import numpy as np
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    train_and_evaluate_failure()
