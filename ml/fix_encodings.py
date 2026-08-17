"""
MAINTIX — Fix Windows cp1252 Encoding Errors
=============================================
Replaces all emoji characters in Python source files with ASCII equivalents.
Run once from the repo root: python ml/fix_encodings.py
"""
import pathlib

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

FILES = [
    "ml/src/training/evaluate.py",
    "ml/src/reporting/report_generator.py",
    "ml/src/processing/silver_processor.py",
    "ml/src/processing/rul_labeler.py",
    "ml/src/processing/leakage_guard.py",
    "ml/src/processing/gold_builder.py",
    "ml/src/processing/feature_engineer.py",
    "ml/src/ingestion/download_datasets.py",
    "ml/src/ingestion/dataset_registry.py",
    "ml/src/mlops/model_cards.py",
    "ml/src/mlops/model_registry.py",
    "ml/src/mlops/champion_challenger.py",
    "ml/src/mlops/continuous_learning.py",
    "ml/src/mlops/drift_monitor.py",
    "ml/src/training/train_rul.py",
    "ml/src/training/train_anomaly.py",
    "ml/src/training/train_failure.py",
    "ml/src/graph/graph_builder.py",
    "ml/main.py",
]

REPLACEMENTS = {
    "\u2705": "[OK]",
    "\u274c": "[FAIL]",
    "\u274C": "[FAIL]",
    "\u23ed\ufe0f": "[SKIP]",
    "\u23ed": "[SKIP]",
    "\U0001f680": "[START]",
    "\u26a0\ufe0f": "[WARN]",
    "\u26a0": "[WARN]",
    "\u2714": "[OK]",
    "\u2716": "[FAIL]",
    "\U0001f4cb": "[REPORT]",
    "\U0001f4ca": "[CHART]",
    "\U0001f4c8": "[GRAPH]",
    "\U0001f527": "[TOOL]",
    "\U0001f9e0": "[AI]",
    "\U0001f916": "[ROBOT]",
    "\U0001f4e6": "[PKG]",
}

for rel in FILES:
    p = REPO_ROOT / rel
    if not p.exists():
        print(f"[SKIP] (not found): {rel}")
        continue
    text = p.read_text(encoding="utf-8")
    new_text = text
    for emoji, replacement in REPLACEMENTS.items():
        new_text = new_text.replace(emoji, replacement)
    if new_text != text:
        p.write_text(new_text, encoding="utf-8")
        print(f"[FIXED] {rel}")
    else:
        print(f"[CLEAN] {rel}")

print("\nEncoding fix complete.")
