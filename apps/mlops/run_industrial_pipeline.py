import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from maintix_mlops.industrial_pipeline import IndustrialTrainingPipeline, DATASET_REGISTRY

pipeline = IndustrialTrainingPipeline(
    root_path=Path("apps/mlops/maintix_industrial_pipeline"),
    tracking_uri="sqlite:///apps/mlops/mlflow.db",
    experiment_name="maintix_industrial_ai",
)

spec = next((spec for spec in DATASET_REGISTRY if spec["id"] == "secom"), None)
if spec is None:
    raise RuntimeError("SECOM dataset specification not found")

print("Downloading SECOM dataset...")
result = pipeline._download_dataset(spec)
print("Downloaded files:", result)

print("Loading SECOM dataset...")
df = pipeline._load_dataframe(result[0])
print("Shape:", df.shape)
print("Columns:", list(df.columns[:20]))
print("Head:\n", df.head())

print("Cleaning and standardizing dataset...")
frame = pipeline._clean_dataframe(df)
frame = pipeline._verify_and_add_timestamp(frame)
frame = pipeline._standardize_dataset(frame, spec)
print("Standardized shape:", frame.shape)
print("Standardized columns:", frame.columns.tolist()[:40])
print(frame.head())

try:
    print("Running training on standardized data...")
    results = pipeline.train_and_compare_models(frame, target_column="label")
    print("Training completed, models:", [r.model_name for r in results])
    print("Metrics:", {r.model_name: r.metrics for r in results})
    report_path = pipeline.generate_reports(frame, results, target_column="label")
    print("Report generated at", report_path)
except Exception as exc:
    import traceback
    traceback.print_exc()
    print("Training pipeline failed:", exc)
