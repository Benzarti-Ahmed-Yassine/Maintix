from ai_platform.modules.base import BaseAiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class AnomalyDetectionModule(BaseAiModule):
    async def run(self, payload: ModuleInput) -> ModuleOutput:
        values = [float(v) for v in (payload.data.get('sensor_values') or {}).values() if isinstance(v, (int, float))]
        threshold = float(payload.data.get('anomaly_threshold', 0.75))
        if not values:
            return ModuleOutput(result={'anomaly_score': 0.0, 'anomalous': False}, metadata={'module': 'anomaly_detection'})

        mean_value = sum(values) / len(values)
        variance = sum((value - mean_value) ** 2 for value in values) / len(values)
        anomaly_score = min(1.0, max(0.0, variance / (mean_value + 1)))
        anomalous = anomaly_score >= threshold
        return ModuleOutput(
            result={
                'anomaly_score': round(anomaly_score, 4),
                'anomalous': anomalous,
                'threshold': threshold,
            },
            metadata={'module': 'anomaly_detection'},
        )
