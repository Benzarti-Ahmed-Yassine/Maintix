from abc import ABC, abstractmethod
from typing import Any
from rag_server.interfaces.payload import RagInput

class PromptTemplate(ABC):

    @abstractmethod
    def render(self, payload: RagInput) -> str:
        pass
