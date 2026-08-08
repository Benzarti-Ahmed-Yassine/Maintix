import tempfile

from maintix_mlops.registry import ModelRegistry
from maintix_mlops.deployment import DeploymentManager


def test_model_registry_promote() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        registry = ModelRegistry(tmpdir)
        model_path = f"{tmpdir}/models/sample.joblib"
        registry.register_version("sample_model", model_path, stage="Staging")
        registry.promote("sample_model", "Production")
        record = registry.get_model("sample_model")
        assert record is not None
        assert record["stage"] == "Production"


def test_deployment_records_model() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        manager = DeploymentManager(storage_root=tmpdir)
        model_path = f"{tmpdir}/models/sample.joblib"
        deployment = manager.deploy_model(model_path, "production", metadata={"env": "prod"})
        assert deployment.exists()
        assert "production" in deployment.name
