from ai_platform.core.registry import ModuleRegistry
from ai_platform.core.config import AIConfig
from ai_platform.core.fallback import DefaultFallbackStrategy, FallbackStrategy
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class InferencePipeline:
    def __init__(
        self,
        config: AIConfig | None = None,
        fallback: FallbackStrategy | None = None,
    ) -> None:
        self.config = config or AIConfig()
        self.fallback = fallback or DefaultFallbackStrategy()
        self.registry = ModuleRegistry

    async def run(self, payload: ModuleInput) -> dict[str, ModuleOutput]:
        results: dict[str, ModuleOutput] = {}
        current_payload = payload

        for step in self.config.pipeline_steps:
            try:
                output = await self._execute_step(step, current_payload)
            except Exception as exc:
                output = await self.fallback.fallback(step, current_payload, exc)

            results[step] = output
            current_payload = ModuleInput(
                context={**current_payload.context, step: output.result},
                data=current_payload.data,
                prompt=current_payload.prompt,
            )

            if step == 'prompt_manager' and output.result.get('prompt'):
                current_payload = ModuleInput(
                    context=current_payload.context,
                    data=current_payload.data,
                    prompt=output.result['prompt'],
                )

        return results

    async def _execute_step(self, module_name: str, payload: ModuleInput) -> ModuleOutput:
        module_cls = self.registry.get(module_name)
        module = module_cls()
        return await module.run(payload)
