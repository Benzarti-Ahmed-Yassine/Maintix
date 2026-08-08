from abc import ABC, abstractmethod
from rag_server.interfaces.payload import RagInput, RagOutput

class RagModule(ABC):

    @abstractmethod
    async def run(self, payload: RagInput) -> RagOutput:
        pass
