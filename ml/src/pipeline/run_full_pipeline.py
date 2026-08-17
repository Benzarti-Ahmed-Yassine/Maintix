"""
MAINTIX Master End-to-End AI Pipeline Orchestrator
===================================================
Executes the full industrial AI intelligence stack in order:
1. Dataset Verification & Registry Check
2. Silver Data Normalization
3. RUL Labeling & Trajectory Monotonicity Audit
4. Feature Engineering (Rolling statistics, gradients, interactions)
5. Gold Task Dataset Construction (RUL, Anomaly, Failure, RL, Graph, RAG)
6. Model Training & Comparison (LightGBM, CNN, AutoEncoder, Isolation Forest)
7. MLOps Model Registry Registration & Champion Promotion
8. Knowledge Graph Construction & Vector Store Indexing
9. Safe Offline RL Policy Learning & Benchmark Simulation
10. Standardized Model Cards & 12 HTML Validation Reports Generation

Usage:
    python ml/src/pipeline/run_full_pipeline.py
"""

from __future__ import annotations

import logging
import sys
import time
from pathlib import Path

# Add project root to sys.path
REPO_ROOT = Path(__file__).resolve().parents[3]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

import yaml
from ml.src.graph.graph_builder import build_default_factory_graph
from ml.src.mlops.model_cards import generate_all_model_cards
from ml.src.mlops.model_registry import ModelMetadata, ModelRegistry
from ml.src.processing.gold_builder import build_gold_datasets
from ml.src.processing.rul_labeler import run_all as run_rul_labeler
from ml.src.processing.silver_processor import run_all as run_silver_processor
from ml.src.reporting.report_generator import generate_all_reports
from ml.src.rl.policy_evaluator import run_policy_benchmark
from ml.src.training.evaluate import run_full_evaluation

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("maintix.master_pipeline")


def run_pipeline():
    start_time = time.time()
    logger.info("============================================================================")
    logger.info("[START] STARTING MAINTIX INDUSTRIAL AI INTELLIGENCE & PROGNOSTICS PIPELINE")
    logger.info("============================================================================")

    # 1. Configuration
    config_path = REPO_ROOT / "ml" / "config.yaml"
    with open(config_path) as f:
        config = yaml.safe_load(f)
    logger.info(f"Loaded platform configuration from {config_path}")

    # 2. Silver Processing
    logger.info("\n[STEP 1/7] Normalizing Raw Telemetry into Silver Datasets...")
    silver_data = run_silver_processor(config)

    # 3. RUL Labeling
    logger.info("\n[STEP 2/7] Executing RUL Labeling & Trajectory Monotonicity Validation...")
    rul_data = run_rul_labeler(config)

    # 4. Gold Dataset Construction
    logger.info("\n[STEP 3/7] Building Task-Specific Gold Datasets (RUL, Anomaly, Failure, RL)...")
    gold_paths = build_gold_datasets()

    # 5. Machine Learning Models Training & Benchmarking
    logger.info("\n[STEP 4/7] Training & Evaluating ML Prognostics & Diagnostic Models...")
    eval_matrix = run_full_evaluation()

    # 6. Knowledge Graph & Vector Store
    logger.info("\n[STEP 5/7] Constructing Industrial Knowledge Graph & Vector RAG Index...")
    graph = build_default_factory_graph()

    # 7. Reinforcement Learning Advisory Policy
    logger.info("\n[STEP 6/7] Learning Safe Offline RL Maintenance Policy & Benchmarking Baselines...")
    rl_bench = run_policy_benchmark(episodes=25)

    # 8. Model Registry, Model Cards & HTML Reports
    logger.info("\n[STEP 7/7] Generating Standardized Model Cards & 12 HTML Validation Reports...")
    generate_all_model_cards()
    generate_all_reports()

    elapsed = time.time() - start_time
    logger.info("\n============================================================================")
    logger.info(f"[DONE] MAINTIX AI PIPELINE EXECUTION COMPLETED IN {elapsed:.2f} SECONDS")
    logger.info("============================================================================")
    logger.info("All model artifacts registered in: ml/mlops/artifacts/")
    logger.info("All HTML validation reports saved in: ml/reports/")
    logger.info("Ready for production inference serving.")


if __name__ == "__main__":
    run_pipeline()
