from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime


class Recommendation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    machine_id: Optional[int] = None
    message: str
    score: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
