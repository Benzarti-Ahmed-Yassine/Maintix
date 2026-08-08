from ai_platform.modules.base import BaseAiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class RulModule(BaseAiModule):
    async def run(self, payload: ModuleInput) -> ModuleOutput:
        anomaly_score = float(payload.context.get('anomaly_detection', {}).get('anomaly_score', 0.0))
        base_rul = 120
        useful_life = max(1, int(base_rul * (1.0 - anomaly_score)))
        return ModuleOutput(
            result={
                'predicted_rul_days': useful_life,
                'anomaly_score': anomaly_score,
                'status': 'degraded' if anomaly_score > 0.3 else 'healthy',
            },
            metadata={'module': 'rul'},
        )
