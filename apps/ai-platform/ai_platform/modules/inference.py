from ai_platform.modules.base import BaseAiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput
from ai_platform.core.model_loader import ModelLoader

class InferenceModule(BaseAiModule):
    def __init__(self) -> None:
        self.loader = ModelLoader()

    async def run(self, payload: ModuleInput) -> ModuleOutput:
        output = await self.loader.infer('inference', payload.prompt, payload.data)
        return ModuleOutput(result=output, metadata={'module': 'inference'})
