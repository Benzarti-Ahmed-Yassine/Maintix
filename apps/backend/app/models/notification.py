from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime


class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = None
    category: Optional[str] = None
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
