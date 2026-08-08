from ai_platform.modules.base import BaseAiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class RootCauseAnalysisModule(BaseAiModule):
    async def run(self, payload: ModuleInput) -> ModuleOutput:
        if payload.context.get('anomaly_detection', {}).get('anomalous'):
            root_cause = 'unexpected sensor drift likely caused by mechanical wear'
        else:
            root_cause = 'no significant root cause detected'

        return ModuleOutput(
            result={'root_cause': root_cause},
            metadata={'module': 'root_cause_analysis'},
        )
