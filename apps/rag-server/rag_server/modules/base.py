from rag_server.interfaces.module import RagModule
from rag_server.interfaces.payload import RagInput, RagOutput

class BaseRagModule(RagModule):
    async def run(self, payload: RagInput) -> RagOutput:
        raise NotImplementedError
