from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text
from maintix_backend.db.base import Base

class ProductionSchedule(Base):
    __tablename__ = 'production_schedules'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False)
    plan = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
