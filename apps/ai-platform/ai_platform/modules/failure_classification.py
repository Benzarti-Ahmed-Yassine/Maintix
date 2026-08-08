from ai_platform.modules.base import BaseAiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class FailureClassificationModule(BaseAiModule):
    async def run(self, payload: ModuleInput) -> ModuleOutput:
        anomaly = payload.context.get('anomaly_detection', {})
        if anomaly.get('anomalous'):
            severity = 'critical' if anomaly.get('anomaly_score', 0) > 0.85 else 'warning'
            category = 'sensor drift' if anomaly.get('anomaly_score', 0) > 0.5 else 'operational variance'
        else:
            severity = 'normal'
            category = 'no failure expected'

        return ModuleOutput(
            result={
                'severity': severity,
                'category': category,
                'confidence': 0.85 if anomaly.get('anomalous') else 0.95,
            },
            metadata={'module': 'failure_classification'},
        )
