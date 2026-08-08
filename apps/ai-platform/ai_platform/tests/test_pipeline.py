import pytest
from ai_platform.core.config import AIConfig
from ai_platform.core.pipeline import InferencePipeline
from ai_platform.core.registry import ModuleRegistry
from ai_platform.interfaces.payload import ModuleInput
from ai_platform.modules.anomaly_detection import AnomalyDetectionModule
from ai_platform.modules.context_builder import ContextBuilderModule
from ai_platform.modules.failure_classification import FailureClassificationModule
from ai_platform.modules.inference import InferenceModule
from ai_platform.modules.prompt_manager import PromptManagerModule


@pytest.fixture(autouse=True)
def registry_cleanup() -> None:
    ModuleRegistry.clear()
    ModuleRegistry.register('context_builder', ContextBuilderModule)
    ModuleRegistry.register('prompt_manager', PromptManagerModule)
    ModuleRegistry.register('inference', InferenceModule)
    ModuleRegistry.register('anomaly_detection', AnomalyDetectionModule)
    ModuleRegistry.register('failure_classification', FailureClassificationModule)
    yield
    ModuleRegistry.clear()


@pytest.mark.asyncio
async def test_pipeline_runs_all_steps() -> None:
    pipeline = InferencePipeline(config=AIConfig(pipeline_steps=[
        'context_builder',
        'prompt_manager',
        'inference',
        'anomaly_detection',
        'failure_classification',
    ]))

    payload = ModuleInput(
        context={},
        data={
            'machine_id': 'machine-123',
            'sensor_values': {'temp': 83.2, 'vibration': 0.22},
            'anomaly_threshold': 0.3,
        },
    )

    outputs = await pipeline.run(payload)

    assert 'context_builder' in outputs
    assert 'prompt_manager' in outputs
    assert 'inference' in outputs
    assert 'anomaly_detection' in outputs
    assert 'failure_classification' in outputs
    assert outputs['anomaly_detection'].result['anomaly_score'] >= 0.0
    assert outputs['failure_classification'].result['confidence'] > 0.0
