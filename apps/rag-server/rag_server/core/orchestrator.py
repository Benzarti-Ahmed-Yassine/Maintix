from typing import Any, Dict
from rag_server.interfaces.module import RagModule
from rag_server.interfaces.payload import RagInput, RagOutput
from rag_server.core.registry import ModuleRegistry

class RagOrchestrator:
    def __init__(self) -> None:
        self.registry = ModuleRegistry

    async def execute(self, module_name: str, payload: RagInput) -> RagOutput:
        module_cls = self.registry.get(module_name)
        module = module_cls()
        return await module.run(payload)

    async def pipeline(self, modules: list[str], payload: RagInput) -> dict[str, RagOutput]:
        results: dict[str, RagOutput] = {}
        current_payload = payload
        current_state = payload.state or {}

        for module_name in modules:
            current_payload.state = current_state
            output = await self.execute(module_name, current_payload)
            results[module_name] = output
            if output.state:
                current_state = {**current_state, **output.state}
            else:
                current_state = {**current_state, f'{module_name}_result': output.result}
            current_payload = RagInput(
                query=current_payload.query,
                documents=current_payload.documents,
                metadata=current_payload.metadata,
                state=current_state,
            )

        return results
