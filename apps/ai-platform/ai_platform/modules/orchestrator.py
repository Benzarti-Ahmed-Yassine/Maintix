from ai_platform.core.orchestrator import AiOrchestrator
from ai_platform.modules.base import BaseAiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class OrchestratorModule(BaseAiModule):
    def __init__(self) -> None:
        self.orchestrator = AiOrchestrator()

    async def run(self, payload: ModuleInput) -> ModuleOutput:
        modules = payload.data.get('submodules', [
            'context_builder',
            'prompt_manager',
            'inference',
            'anomaly_detection',
            'failure_classification',
            'rul',
            'root_cause_analysis',
            'recommendation_engine',
            'explainable_ai',
        ])
        outputs = await self.orchestrator.batch_execute(modules, payload)
        return ModuleOutput(
            result={'orchestrated_steps': list(outputs.keys()), 'outputs': {name: output.result for name, output in outputs.items()}},
            metadata={'module': 'orchestrator'},
        )
