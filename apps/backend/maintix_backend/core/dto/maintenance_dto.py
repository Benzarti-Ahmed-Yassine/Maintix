from pydantic import BaseModel
from datetime import datetime

class MaintenanceOrderDTO(BaseModel):
    id: int
    asset_id: int
    title: str
    description: str | None
    status: str
    assigned_to: int | None
    scheduled_at: datetime | None
    created_at: datetime
    updated_at: datetime
