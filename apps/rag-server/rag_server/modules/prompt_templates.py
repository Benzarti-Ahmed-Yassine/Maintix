from rag_server.modules.base import BaseRagModule
from rag_server.interfaces.payload import RagInput, RagOutput
from rag_server.core.config import RagConfig

class PromptTemplateModule(BaseRagModule):
    def __init__(self) -> None:
        self.config = RagConfig()

    async def run(self, payload: RagInput) -> RagOutput:
        state = payload.state or {}
        context = state.get('context', '')
        prompt = self.config.prompt_template.format(context=context, query=payload.query)
        citations = [self.config.citation_template.format(source=item.get('metadata', {}).get('source', 'unknown')) for item in (state.get('retrieved_results', []) or [])]
        return RagOutput(results=[{'prompt': prompt, 'citations': citations}], context={'prompt_length': len(prompt)}, state={'prompt': prompt, 'citations': citations})
