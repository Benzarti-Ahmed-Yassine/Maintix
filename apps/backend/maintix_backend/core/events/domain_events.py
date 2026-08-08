from dataclasses import dataclass
from datetime import datetime

@dataclass
class MaintenanceOrderCreated:
    order_id: int
    asset_id: int
    scheduled_at: datetime

@dataclass
class ProductionScheduleUpdated:
    schedule_id: int
    status: str
    updated_at: datetime
