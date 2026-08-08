from typing import Any, Dict
from ai_platform.interfaces.module import ModuleInput, ModuleOutput
from ai_platform.core.registry import ModuleRegistry

class AiOrchestrator:
    def __init__(self) -> None:
        self.registry = ModuleRegistry

    async def execute(self, module_name: str, payload: ModuleInput) -> ModuleOutput:
        module_cls = self.registry.get(module_name)
        module = module_cls()
        return await module.run(payload)

    async def batch_execute(self, modules: list[str], payload: ModuleInput) -> dict[str, ModuleOutput]:
        results: dict[str, ModuleOutput] = {}
        for module_name in modules:
            results[module_name] = await self.execute(module_name, payload)
        return results
