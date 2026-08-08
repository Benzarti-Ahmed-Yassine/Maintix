import tempfile

import numpy as np
import pandas as pd

from maintix_mlops.drift import DriftDetector
from maintix_mlops.monitoring import MonitoringService


def test_drift_detector_detects_change() -> None:
    baseline = pd.Series(np.random.normal(0, 1, size=100))
    current = pd.Series(np.random.normal(1, 1, size=100))
    detector = DriftDetector(threshold=0.05)
    result = detector.detect_drift(baseline, current)
    assert "drift_score" in result
    assert isinstance(result["drift_detected"], bool)


def test_monitoring_records_metric() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        service = MonitoringService(log_path=f"{tmpdir}/logs")
        path = service.record_metric("latency", 15.5, metadata={"endpoint": "predict"})
        assert path.exists()
        metrics = service.read_metrics()
        assert any(record["metric"] == "latency" for record in metrics)
