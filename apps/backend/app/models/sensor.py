from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from app.models.machine import Machine


class Sensor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    machine_id: int = Field(foreign_key="machine.id")
    name: str
    unit: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
