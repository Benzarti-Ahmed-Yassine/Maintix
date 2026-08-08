from rag_server.modules.base import BaseRagModule
from rag_server.interfaces.payload import RagInput, RagOutput

class ContextBuilderModule(BaseRagModule):
    async def run(self, payload: RagInput) -> RagOutput:
        retrieved = (payload.state or {}).get('retrieved_results', [])
        context = '\n'.join([f"[{item.get('metadata', {}).get('source', 'unknown')}] {item.get('content', '')}" for item in retrieved])
        return RagOutput(results=[{'context': context}], context={'context_length': len(context)}, state={'context': context})
