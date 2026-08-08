from ai_platform.interfaces.module import AiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class BaseAiModule(AiModule):
    async def run(self, payload: ModuleInput) -> ModuleOutput:
        raise NotImplementedError
