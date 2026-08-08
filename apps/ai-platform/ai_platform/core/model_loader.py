from typing import Any
from ai_platform.adapters.external_adapter import ExternalInferenceAdapter
from ai_platform.core.config import AIConfig

class ModelLoader:
    def __init__(self, config: AIConfig | None = None) -> None:
        self.config = config or AIConfig()
        self.adapter = ExternalInferenceAdapter()
        self._models: dict[str, dict[str, Any]] = {
            'anomaly_detection': {'type': 'local', 'name': 'anomaly-detector-v1'},
            'failure_classification': {'type': 'local', 'name': 'failure-classifier-v1'},
            'rul': {'type': 'local', 'name': 'rul-estimator-v1'},
            'recommendation_engine': {'type': 'local', 'name': 'recommendation-engine-v1'},
            'root_cause_analysis': {'type': 'local', 'name': 'root-cause-analyzer-v1'},
            'explainable_ai': {'type': 'local', 'name': 'explainability-engine-v1'},
            'inference': {'type': 'local', 'name': 'inference-engine-v1'},
        }

    def load(self, module_name: str) -> dict[str, Any]:
        if self.config.use_external_adapter:
            return {'type': 'external', 'name': module_name}
        if module_name not in self._models:
            raise ValueError(f'Model for module "{module_name}" is not available')
        return self._models[module_name]

    async def infer(self, module_name: str, prompt: str | None, data: dict[str, Any]) -> dict[str, Any]:
        model = self.load(module_name)
        if model['type'] == 'external':
            adapter_payload = {
                'module': module_name,
                'model': model['name'],
                'prompt': prompt,
                'data': data,
            }
            return await self.adapter.request(adapter_payload)

        return {
            'model': model['name'],
            'prompt': prompt,
            'data_summary': {k: (v if isinstance(v, (int, float, str, bool)) else str(v)) for k, v in data.items()},
            'prediction': {
                'confidence': 0.82,
                'status': 'completed',
                'tag': 'baseline',
            },
        }
