from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime


class MaintenanceTask(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    machine_id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
