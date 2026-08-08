from ai_platform.modules.base import BaseAiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class ContextBuilderModule(BaseAiModule):
    async def run(self, payload: ModuleInput) -> ModuleOutput:
        sensor_values = payload.data.get('sensor_values', {}) or {}
        readings = [float(value) for value in sensor_values.values() if isinstance(value, (int, float))]
        summary = {
            'machine_id': payload.data.get('machine_id', 'unknown'),
            'sensor_count': len(sensor_values),
            'max_value': max(readings) if readings else None,
            'min_value': min(readings) if readings else None,
            'average_value': sum(readings) / len(readings) if readings else None,
        }
        return ModuleOutput(result={'context': summary}, metadata={'module': 'context_builder'})
