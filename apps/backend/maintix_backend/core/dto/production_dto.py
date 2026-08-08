from pydantic import BaseModel
from datetime import datetime

class ProductionScheduleDTO(BaseModel):
    id: int
    name: str
    description: str | None
    status: str
    plan: str | None
    created_at: datetime
    updated_at: datetime
