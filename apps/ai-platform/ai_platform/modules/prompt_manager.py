from ai_platform.modules.base import BaseAiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput
from ai_platform.services.prompt_service import PromptService

class PromptManagerModule(BaseAiModule):
    def __init__(self) -> None:
        self.prompt_service = PromptService()

    async def run(self, payload: ModuleInput) -> ModuleOutput:
        prompt = self.prompt_service.build_prompt(
            goal='optimize maintenance and failure prediction',
            context=payload.context,
            data=payload.data,
        )
        return ModuleOutput(result={'prompt': prompt}, metadata={'module': 'prompt_manager'})
