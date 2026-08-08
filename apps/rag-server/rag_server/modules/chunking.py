from rag_server.modules.base import BaseRagModule
from rag_server.interfaces.payload import RagInput, RagOutput
from rag_server.core.config import RagConfig
from rag_server.core.store import MemoryDocumentStore

class ChunkingModule(BaseRagModule):
    def __init__(self) -> None:
        self.config = RagConfig()

    async def run(self, payload: RagInput) -> RagOutput:
        documents = payload.documents or await MemoryDocumentStore.list_documents(None)
        chunks: list[dict[str, object]] = []
        step = max(1, self.config.chunk_size - self.config.chunk_overlap)

        for document in documents:
            text = str(document.get('content', ''))
            source = document.get('id', document.get('source', 'unknown'))
            for start in range(0, len(text), step):
                chunk_text = text[start:start + self.config.chunk_size]
                if not chunk_text:
                    continue
                metadata = {'chunk_id': len(chunks) + 1, 'source': source, 'start': start, 'end': start + len(chunk_text)}
                chunks.append({'content': chunk_text, 'metadata': metadata})

        return RagOutput(results=chunks, context={'chunk_count': len(chunks)}, state={'chunks': chunks})
