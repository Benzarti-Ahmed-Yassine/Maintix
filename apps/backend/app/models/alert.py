from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime


class Alert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sensor_id: Optional[int] = None
    machine_id: Optional[int] = None
    level: str = "info"
    message: str
    acknowledged: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
