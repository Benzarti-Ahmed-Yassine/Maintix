import tempfile

import pandas as pd

from maintix_mlops.training import TrainingPipeline


def test_training_pipeline_classification() -> None:
    df = pd.DataFrame({
        "feature_a": [1.0, 2.0, 3.0, 4.0, 5.0],
        "feature_b": [0, 1, 0, 1, 0],
        "target": [0, 1, 0, 1, 0],
    })

    with tempfile.TemporaryDirectory() as tmpdir:
        pipeline = TrainingPipeline(tracking_uri=f"file:{tmpdir}/mlruns", artifact_root=f"{tmpdir}/artifacts")
        result = pipeline.train(df, target_column="target", model_name="test_classifier")
        assert "model_path" in result
        assert "metrics" in result
        assert "run_id" in result


def test_training_pipeline_invalid_dataset_raises() -> None:
    df = pd.DataFrame({"feature_a": [1.0], "feature_b": [2.0]})

    with tempfile.TemporaryDirectory() as tmpdir:
        pipeline = TrainingPipeline(tracking_uri=f"file:{tmpdir}/mlruns", artifact_root=f"{tmpdir}/artifacts")
        try:
            pipeline.train(df, target_column="target", model_name="test_error")
        except ValueError as exc:
            assert "Dataset validation failed" in str(exc)
