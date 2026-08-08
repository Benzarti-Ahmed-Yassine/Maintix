from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime


class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    payload: Optional[str] = None
    owner_id: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
