from __future__ import annotations

import random
from dataclasses import dataclass


@dataclass
class PlantEvent:
    asset_id: int
    severity: str
    message: str


class IndustrialSimulation:
    def __init__(self, seed: int = 7) -> None:
        self.seed = seed
        random.seed(seed)

    def generate_events(self, count: int = 5) -> list[PlantEvent]:
        events: list[PlantEvent] = []
        templates = [
            ('temperature drift', 'Bearing temperature above expected range'),
            ('vibration spike', 'Motor vibration exceeds threshold for 3 minutes'),
            ('pressure anomaly', 'Hydraulic pressure deviated from nominal band'),
        ]
        for index in range(count):
            severity = 'critical' if index % 3 == 0 else 'warning'
            label, message = templates[index % len(templates)]
            events.append(PlantEvent(asset_id=100 + index, severity=severity, message=f'{label}: {message}'))
        return events

    def run(self, count: int = 5) -> list[dict[str, object]]:
        return [
            {
                'asset_id': event.asset_id,
                'severity': event.severity,
                'message': event.message,
                'recommended_action': 'dispatch maintenance crew' if event.severity == 'critical' else 'monitor and recheck',
            }
            for event in self.generate_events(count)
        ]
