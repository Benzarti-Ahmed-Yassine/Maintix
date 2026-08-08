from rag_server.modules.base import BaseRagModule
from rag_server.interfaces.payload import RagInput, RagOutput
from rag_server.core.store import MemoryDocumentStore

class DocumentModule(BaseRagModule):
    async def run(self, payload: RagInput) -> RagOutput:
        documents = payload.documents or []
        if documents:
            await MemoryDocumentStore.ingest(documents)
        stored = await MemoryDocumentStore.list_documents(None)
        return RagOutput(results=stored, context={'document_count': len(stored)}, state={'documents': stored})
