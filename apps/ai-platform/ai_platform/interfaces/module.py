from abc import ABC, abstractmethod
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class AiModule(ABC):

    @abstractmethod
    async def run(self, payload: ModuleInput) -> ModuleOutput:
        pass
