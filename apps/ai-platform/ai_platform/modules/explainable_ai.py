from ai_platform.modules.base import BaseAiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class ExplainableAiModule(BaseAiModule):
    async def run(self, payload: ModuleInput) -> ModuleOutput:
        explanations = []
        if payload.context.get('failure_classification', {}).get('severity') == 'critical':
            explanations.append('High anomaly score and critical severity indicate urgent attention.')
        elif payload.context.get('failure_classification', {}).get('severity') == 'warning':
            explanations.append('Warning severity suggests closer monitoring is needed.')
        else:
            explanations.append('System appears stable with no immediate concerns.')

        if payload.context.get('rul', {}).get('predicted_rul_days', 0) < 30:
            explanations.append('Remaining useful life is low; plan for maintenance soon.')

        return ModuleOutput(
            result={'explanations': explanations},
            metadata={'module': 'explainable_ai'},
        )
