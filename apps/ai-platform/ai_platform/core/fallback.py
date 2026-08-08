from abc import ABC, abstractmethod
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class FallbackStrategy(ABC):
    @abstractmethod
    async def fallback(self, module_name: str, payload: ModuleInput, error: Exception) -> ModuleOutput:
        pass

class DefaultFallbackStrategy(FallbackStrategy):
    async def fallback(self, module_name: str, payload: ModuleInput, error: Exception) -> ModuleOutput:
        fallback_payload = {
            'fallback': True,
            'module': module_name,
            'message': f'Fallback applied for {module_name}',
            'error': str(error),
        }
        if payload.data:
            fallback_payload['data_snapshot'] = {k: repr(v) for k, v in payload.data.items()}
        return ModuleOutput(result=fallback_payload, metadata={'source': 'default_fallback'})
