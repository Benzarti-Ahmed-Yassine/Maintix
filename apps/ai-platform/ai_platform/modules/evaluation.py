from ai_platform.modules.base import BaseAiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class EvaluationModule(BaseAiModule):
    async def run(self, payload: ModuleInput) -> ModuleOutput:
        return ModuleOutput(result={'architecture': 'evaluation placeholder'}, metadata={})
