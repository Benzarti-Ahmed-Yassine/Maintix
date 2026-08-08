from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from maintix_backend.db.base import Base

class MaintenanceOrder(Base):
    __tablename__ = 'maintenance_orders'

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey('assets.id'), nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False)
    assigned_to = Column(Integer, ForeignKey('users.id'), nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    asset = relationship('Asset')
    assignee = relationship('User')
