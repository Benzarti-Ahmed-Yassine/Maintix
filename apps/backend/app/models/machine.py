from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime


class Machine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    location: Optional[str] = None
    metadata: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
